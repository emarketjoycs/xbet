import cron from 'node-cron';
import { config } from '../config/config.js';
import apiSportsService from './apiSportsService.js';
import theOddsApiService from './theOddsApiService.js';
import contractService from './contractService.js';

/**
 * Serviço Oracle para validação de resultados de partidas
 */
class OracleService {
  constructor() {
    this.isRunning = false;
    this.processedMarkets = new Set(); // Evitar processar o mesmo mercado múltiplas vezes
  }

  /**
   * Inicia o Oracle com cron job
   */
  start() {
    console.log('🔮 Oracle iniciado!');
    console.log(`⏰ Verificação agendada: ${config.oracle.checkInterval}`);

    // Executar imediatamente na inicialização
    this.checkPendingMarkets();

    // Agendar verificações periódicas
    cron.schedule(config.oracle.checkInterval, () => {
      this.checkPendingMarkets();
    });

    // Escutar eventos do contrato
    contractService.listenToEvents();
  }

  /**
   * Verifica mercados pendentes de validação
   */
  async checkPendingMarkets() {
    if (this.isRunning) {
      console.log('⏭️  Verificação anterior ainda em andamento, pulando...');
      return;
    }

    this.isRunning = true;

    try {
      console.log('\n🔍 Verificando mercados pendentes...');
      
      const activeMarkets = await contractService.getActiveMarkets();
      
      if (activeMarkets.length === 0) {
        console.log('✅ Nenhum mercado pendente de validação');
        return;
      }

      console.log(`📊 ${activeMarkets.length} mercado(s) pendente(s) de validação`);

      for (const market of activeMarkets) {
        // Evitar processar o mesmo mercado múltiplas vezes
        if (this.processedMarkets.has(market.marketId)) {
          console.log(`⏭️  Mercado #${market.marketId} já processado, pulando...`);
          continue;
        }

        await this.validateAndSettleMarket(market);
      }
    } catch (error) {
      console.error('❌ Erro ao verificar mercados pendentes:', error.message);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Valida e define o resultado de um mercado
   * @param {Object} market - Informações do mercado
   */
  async validateAndSettleMarket(market) {
    try {
      console.log(`\n🎯 Validando mercado #${market.marketId}`);
      console.log(`   ${market.homeTeam} vs ${market.awayTeam}`);
      console.log(`   Liga: ${market.league}`);

      // Buscar resultado de múltiplas APIs
      const results = await this.fetchResultsFromApis(market);

      if (results.length === 0) {
        console.log(`⚠️  Nenhuma API retornou resultado para o mercado #${market.marketId}`);
        return;
      }

      // Verificar consenso
      const consensus = this.checkConsensus(results);

      if (!consensus) {
        console.log(`⚠️  Sem consenso entre as APIs para o mercado #${market.marketId}`);
        console.log(`   Resultados recebidos:`, results.map(r => `${r.api}: ${r.outcome}`).join(', '));
        return;
      }

      console.log(`✅ Consenso alcançado: ${consensus.outcome}`);
      console.log(`   ${consensus.count}/${results.length} APIs concordam`);

      // Converter outcome para número (0=Casa, 1=Empate, 2=Fora)
      const winningOutcome = this.outcomeToNumber(consensus.outcome);

      // Definir resultado no contrato
      await contractService.settleMarket(market.marketId, winningOutcome);

      // Marcar como processado
      this.processedMarkets.add(market.marketId);

      console.log(`🎉 Mercado #${market.marketId} finalizado com sucesso!`);
    } catch (error) {
      console.error(`❌ Erro ao validar mercado #${market.marketId}:`, error.message);
    }
  }

  /**
   * Busca resultados de múltiplas APIs
   * @param {Object} market - Informações do mercado
   * @returns {Promise<Array>} Lista de resultados
   */
  async fetchResultsFromApis(market) {
    const results = [];

    // API-Sports.io (sempre habilitada)
    if (config.oracle.enabledApis.includes('api-sports')) {
      try {
        // Buscar partidas de hoje e dos últimos dias
        const matches = await apiSportsService.getTodayMatches();
        
        // Tentar encontrar a partida pelos nomes dos times
        const match = matches.find(m => 
          this.normalizeTeamName(m.homeTeam) === this.normalizeTeamName(market.homeTeam) &&
          this.normalizeTeamName(m.awayTeam) === this.normalizeTeamName(market.awayTeam)
        );

        if (match && match.status === 'FT') {
          let outcome;
          if (match.homeGoals > match.awayGoals) {
            outcome = 'home';
          } else if (match.homeGoals < match.awayGoals) {
            outcome = 'away';
          } else {
            outcome = 'draw';
          }

          results.push({
            api: 'api-sports',
            outcome: outcome,
            homeScore: match.homeGoals,
            awayScore: match.awayGoals
          });

          console.log(`   ✅ API-Sports: ${outcome} (${match.homeGoals}-${match.awayGoals})`);
        }
      } catch (error) {
        console.error('   ❌ Erro ao buscar resultado da API-Sports:', error.message);
      }
    }

    // The Odds API (se habilitada e configurada)
    if (config.oracle.enabledApis.includes('the-odds-api') && config.theOddsApi.key) {
      try {
        // Nota: The Odds API requer o eventId específico
        // Em produção, você precisaria armazenar o eventId ao criar o mercado
        // Por enquanto, vamos pular esta API se não tivermos o eventId
        console.log('   ⏭️  The Odds API: eventId não disponível, pulando...');
      } catch (error) {
        console.error('   ❌ Erro ao buscar resultado da The Odds API:', error.message);
      }
    }

    return results;
  }

  /**
   * Verifica consenso entre os resultados das APIs
   * @param {Array} results - Lista de resultados
   * @returns {Object|null} Consenso ou null se não houver
   */
  checkConsensus(results) {
    if (results.length === 0) {
      return null;
    }

    // Contar votos para cada outcome
    const votes = {
      home: 0,
      draw: 0,
      away: 0
    };

    results.forEach(result => {
      votes[result.outcome]++;
    });

    // Encontrar o outcome com mais votos
    let maxVotes = 0;
    let winningOutcome = null;

    Object.entries(votes).forEach(([outcome, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        winningOutcome = outcome;
      }
    });

    // Verificar se atingiu o consenso mínimo
    if (maxVotes >= config.oracle.requiredConsensus) {
      return {
        outcome: winningOutcome,
        count: maxVotes
      };
    }

    return null;
  }

  /**
   * Converte outcome string para número
   * @param {string} outcome - 'home', 'draw' ou 'away'
   * @returns {number} 0, 1 ou 2
   */
  outcomeToNumber(outcome) {
    const map = {
      'home': 0,
      'draw': 1,
      'away': 2
    };
    return map[outcome];
  }

  /**
   * Normaliza nome de time para comparação
   * @param {string} teamName - Nome do time
   * @returns {string} Nome normalizado
   */
  normalizeTeamName(teamName) {
    return teamName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]/g, '') // Remove caracteres especiais
      .trim();
  }

  /**
   * Para o Oracle
   */
  stop() {
    console.log('🛑 Oracle parado');
    this.isRunning = false;
  }
}

// Exportar instância singleton
const oracleService = new OracleService();
export default oracleService;

// Se executado diretamente (não importado)
if (import.meta.url === `file://${process.argv[1]}`) {
  import('../config/config.js').then(({ validateConfig }) => {
    validateConfig();
    oracleService.start();
    
    // Manter o processo rodando
    process.on('SIGINT', () => {
      console.log('\n👋 Encerrando Oracle...');
      oracleService.stop();
      process.exit(0);
    });
  });
}
