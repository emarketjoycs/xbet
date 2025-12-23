import { ethers } from 'ethers';
import { config } from '../config/config.js';

/**
 * ABI do contrato (apenas funções necessárias para o oracle)
 */
const CONTRACT_ABI = [
  "function settleMarket(uint256 marketId, uint8 winningOutcome) external",
  "function voidMarket(uint256 marketId) external",
  "function getMarket(uint256 marketId) external view returns (uint8 state, uint256 startTime, uint256 activationDeadline, uint256 totalPools, uint8 outcomesCount, string memory homeTeam, string memory awayTeam, string memory league, uint8 winningOutcome, bool resultSet)",
  "function marketCounter() external view returns (uint256)",
  "event MarketCreated(uint256 indexed marketId, uint256 startTime, uint8 outcomesCount, string homeTeam, string awayTeam, string league)",
  "event MarketSettled(uint256 indexed marketId, uint8 winningOutcome)",
  "event MarketVoided(uint256 indexed marketId)"
];

/**
 * Serviço para interação com o Smart Contract
 */
class ContractService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.oraclePrivateKey, this.provider);
    this.contract = new ethers.Contract(
      config.contractAddress,
      CONTRACT_ABI,
      this.wallet
    );
  }

  /**
   * Define o resultado de um mercado
   * @param {number} marketId - ID do mercado
   * @param {number} winningOutcome - Resultado vencedor (0=Casa, 1=Empate, 2=Fora)
   * @returns {Promise<Object>} Recibo da transação
   */
  async settleMarket(marketId, winningOutcome) {
    try {
      console.log(`📝 Definindo resultado do mercado ${marketId}: ${winningOutcome}`);
      
      const tx = await this.contract.settleMarket(marketId, winningOutcome);
      console.log(`⏳ Transação enviada: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ Mercado ${marketId} finalizado com sucesso!`);
      
      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error(`❌ Erro ao definir resultado do mercado ${marketId}:`, error.message);
      throw error;
    }
  }

  /**
   * Invalida um mercado (em caso de cancelamento)
   * @param {number} marketId - ID do mercado
   * @returns {Promise<Object>} Recibo da transação
   */
  async voidMarket(marketId) {
    try {
      console.log(`🚫 Invalidando mercado ${marketId}`);
      
      const tx = await this.contract.voidMarket(marketId);
      console.log(`⏳ Transação enviada: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ Mercado ${marketId} invalidado com sucesso!`);
      
      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error(`❌ Erro ao invalidar mercado ${marketId}:`, error.message);
      throw error;
    }
  }

  /**
   * Busca informações de um mercado
   * @param {number} marketId - ID do mercado
   * @returns {Promise<Object>} Informações do mercado
   */
  async getMarket(marketId) {
    try {
      const market = await this.contract.getMarket(marketId);
      
      return {
        state: Number(market[0]), // 0=CREATED, 1=FORMING, 2=ACTIVE, 3=SETTLED, 4=VOIDED
        startTime: Number(market[1]),
        activationDeadline: Number(market[2]),
        totalPools: ethers.formatUnits(market[3], 6), // USDC tem 6 decimais
        outcomesCount: Number(market[4]),
        homeTeam: market[5],
        awayTeam: market[6],
        league: market[7],
        winningOutcome: Number(market[8]),
        resultSet: market[9]
      };
    } catch (error) {
      console.error(`Erro ao buscar mercado ${marketId}:`, error.message);
      throw error;
    }
  }

  /**
   * Retorna o número total de mercados criados
   * @returns {Promise<number>} Contador de mercados
   */
  async getMarketCounter() {
    try {
      const counter = await this.contract.marketCounter();
      return Number(counter);
    } catch (error) {
      console.error('Erro ao buscar contador de mercados:', error.message);
      throw error;
    }
  }

  /**
   * Busca todos os mercados ativos que precisam de validação
   * @returns {Promise<Array>} Lista de mercados ativos
   */
  async getActiveMarkets() {
    try {
      const marketCounter = await this.getMarketCounter();
      const activeMarkets = [];

      for (let i = 1; i <= marketCounter; i++) {
        try {
          const market = await this.getMarket(i);
          
          // State 2 = ACTIVE
          if (market.state === 2 && !market.resultSet) {
            const now = Math.floor(Date.now() / 1000);
            
            // Verificar se o jogo já deveria ter terminado (2 horas após o início)
            if (now >= market.startTime + 7200) {
              activeMarkets.push({
                marketId: i,
                ...market
              });
            }
          }
        } catch (error) {
          console.error(`Erro ao buscar mercado ${i}:`, error.message);
        }
      }

      return activeMarkets;
    } catch (error) {
      console.error('Erro ao buscar mercados ativos:', error.message);
      return [];
    }
  }

  /**
   * Escuta eventos do contrato
   */
  listenToEvents() {
    console.log('👂 Escutando eventos do contrato...');

    this.contract.on('MarketCreated', (marketId, startTime, outcomesCount, homeTeam, awayTeam, league) => {
      console.log(`🆕 Novo mercado criado: #${marketId}`);
      console.log(`   ${homeTeam} vs ${awayTeam}`);
      console.log(`   Liga: ${league}`);
      console.log(`   Início: ${new Date(Number(startTime) * 1000).toLocaleString()}`);
    });

    this.contract.on('MarketSettled', (marketId, winningOutcome) => {
      console.log(`✅ Mercado #${marketId} finalizado com resultado: ${winningOutcome}`);
    });

    this.contract.on('MarketVoided', (marketId) => {
      console.log(`🚫 Mercado #${marketId} invalidado`);
    });
  }
}

export default new ContractService();
