import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Blockchain
  rpcUrl: process.env.RPC_URL || 'https://polygon-rpc.com',
  chainId: 137, // Polygon PoS Mainnet
  contractAddress: process.env.CONTRACT_ADDRESS,
  oraclePrivateKey: process.env.ORACLE_PRIVATE_KEY,
  
  // USDC Token na Polygon PoS
  usdcAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  
  // APIs de Esportes
  apiSports: {
    key: process.env.API_SPORTS_KEY,
    baseUrl: 'https://v3.football.api-sports.io'
  },
  
  theOddsApi: {
    key: process.env.THE_ODDS_API_KEY,
    baseUrl: 'https://api.the-odds-api.com/v4'
  },
  
  // Configurações do Oracle
  oracle: {
    checkInterval: '*/10 * * * *', // A cada 10 minutos
    requiredConsensus: 2, // Número mínimo de APIs que devem concordar
    enabledApis: ['api-sports', 'the-odds-api']
  },
  
  // Configurações do servidor
  port: process.env.PORT || 3001,
  
  // Logs
  logLevel: process.env.LOG_LEVEL || 'info'
};

// Validar configurações obrigatórias
export function validateConfig() {
  const required = [
    'CONTRACT_ADDRESS',
    'ORACLE_PRIVATE_KEY',
    'API_SPORTS_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  console.log('✅ Configuração validada com sucesso');
}
