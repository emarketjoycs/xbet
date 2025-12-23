import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './config/config.js';
import oracleService from './services/oracle.js';
import apiSportsService from './services/apiSportsService.js';
import theOddsApiService from './services/theOddsApiService.js';
import contractService from './services/contractService.js';

// Validar configuração
validateConfig();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ============================================
// ROTAS DA API
// ============================================

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    oracle: {
      running: oracleService.isRunning,
      interval: config.oracle.checkInterval
    }
  });
});

/**
 * Busca partidas futuras de uma liga
 */
app.get('/api/matches/future', async (req, res) => {
  try {
    const { leagueId, season } = req.query;
    
    if (!leagueId || !season) {
      return res.status(400).json({
        error: 'leagueId e season são obrigatórios'
      });
    }

    const matches = await apiSportsService.getFutureMatches(leagueId, season);
    
    res.json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

/**
 * Busca odds de uma partida
 */
app.get('/api/matches/:fixtureId/odds', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    
    const odds = await apiSportsService.getMatchOdds(fixtureId);
    
    if (!odds) {
      return res.status(404).json({
        error: 'Odds não encontradas para esta partida'
      });
    }

    res.json({
      success: true,
      data: odds
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

/**
 * Busca resultado de uma partida
 */
app.get('/api/matches/:fixtureId/result', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    
    const result = await apiSportsService.getMatchResult(fixtureId);
    
    if (!result) {
      return res.status(404).json({
        error: 'Resultado não encontrado'
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

/**
 * Busca partidas de hoje
 */
app.get('/api/matches/today', async (req, res) => {
  try {
    const matches = await apiSportsService.getTodayMatches();
    
    res.json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

/**
 * Busca informações de um mercado no contrato
 */
app.get('/api/markets/:marketId', async (req, res) => {
  try {
    const { marketId } = req.params;
    
    const market = await contractService.getMarket(marketId);
    
    res.json({
      success: true,
      data: market
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

/**
 * Busca mercados ativos pendentes de validação
 */
app.get('/api/markets/active', async (req, res) => {
  try {
    const markets = await contractService.getActiveMarkets();
    
    res.json({
      success: true,
      count: markets.length,
      data: markets
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

/**
 * Força verificação manual de mercados pendentes (apenas para testes)
 */
app.post('/api/oracle/check', async (req, res) => {
  try {
    // Executar verificação em background
    oracleService.checkPendingMarkets().catch(error => {
      console.error('Erro na verificação manual:', error);
    });
    
    res.json({
      success: true,
      message: 'Verificação iniciada em background'
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

/**
 * Normaliza odds de uma partida (calcula seed virtual)
 */
app.post('/api/odds/normalize', async (req, res) => {
  try {
    const { home, draw, away, seedAmount } = req.body;
    
    if (!home || !away || !seedAmount) {
      return res.status(400).json({
        error: 'home, away e seedAmount são obrigatórios'
      });
    }

    // Converter odds em probabilidades implícitas
    const homeProb = 1 / home;
    const drawProb = draw ? 1 / draw : 0;
    const awayProb = 1 / away;
    
    // Normalizar para somar 100%
    const total = homeProb + drawProb + awayProb;
    const homeNorm = homeProb / total;
    const drawNorm = drawProb / total;
    const awayNorm = awayProb / total;
    
    // Distribuir seed virtual proporcionalmente
    const homePool = seedAmount * homeNorm;
    const drawPool = seedAmount * drawNorm;
    const awayPool = seedAmount * awayNorm;
    
    res.json({
      success: true,
      data: {
        probabilities: {
          home: (homeNorm * 100).toFixed(2) + '%',
          draw: (drawNorm * 100).toFixed(2) + '%',
          away: (awayNorm * 100).toFixed(2) + '%'
        },
        pools: {
          home: homePool.toFixed(2),
          draw: drawPool.toFixed(2),
          away: awayPool.toFixed(2),
          total: seedAmount
        },
        minimumPools: {
          home: homePool.toFixed(2),
          draw: drawPool.toFixed(2),
          away: awayPool.toFixed(2)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// ============================================
// INICIALIZAÇÃO
// ============================================

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`\n🚀 Backend iniciado na porta ${PORT}`);
  console.log(`📡 RPC URL: ${config.rpcUrl}`);
  console.log(`📝 Contract Address: ${config.contractAddress}`);
  console.log(`\n🔮 Iniciando Oracle...`);
  
  // Iniciar Oracle
  oracleService.start();
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
  console.error('❌ Erro não tratado:', error);
});

process.on('SIGINT', () => {
  console.log('\n👋 Encerrando servidor...');
  oracleService.stop();
  process.exit(0);
});
