const hre = require("hardhat");

// Endereço do USDC em Arbitrum One
const USDC_ARBITRUM_ONE = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5F86";

// Endereço do USDC em Arbitrum Sepolia (testnet)
const USDC_ARBITRUM_SEPOLIA = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";

async function main() {
  console.log("🚀 Iniciando deploy do BettingPool...\n");

  // Obter signer
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Deploying com conta: ${deployer.address}\n`);

  // Obter network
  const network = await hre.ethers.provider.getNetwork();
  console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})\n`);

  // Escolher endereço USDC baseado na network
  let usdcAddress;
  let houseWallet;

  if (network.chainId === 42161) {
    // Arbitrum One (mainnet)
    usdcAddress = USDC_ARBITRUM_ONE;
    houseWallet = "0x"; // TODO: Adicionar endereço da carteira da casa
    console.log("📍 Detectado Arbitrum One (Mainnet)");
  } else if (network.chainId === 421614) {
    // Arbitrum Sepolia (testnet)
    usdcAddress = USDC_ARBITRUM_SEPOLIA;
    houseWallet = deployer.address; // Usar deployer como house wallet em testnet
    console.log("📍 Detectado Arbitrum Sepolia (Testnet)");
  } else {
    console.error("❌ Network não suportada!");
    process.exit(1);
  }

  console.log(`💰 USDC Address: ${usdcAddress}`);
  console.log(`🏠 House Wallet: ${houseWallet}\n`);

  // Deploy BettingPool
  console.log("⏳ Deploying BettingPool...");
  const BettingPool = await hre.ethers.getContractFactory("BettingPool");
  const bettingPool = await BettingPool.deploy(usdcAddress, houseWallet);
  await bettingPool.waitForDeployment();

  const bettingPoolAddress = await bettingPool.getAddress();
  console.log(`✅ BettingPool deployed: ${bettingPoolAddress}\n`);

  // Verificar no Etherscan
  console.log("📋 Informações do Deploy:");
  console.log(`   - Contrato: ${bettingPoolAddress}`);
  console.log(`   - USDC: ${usdcAddress}`);
  console.log(`   - House Wallet: ${houseWallet}`);
  console.log(`   - Network: ${network.name}`);
  console.log(`   - Deployer: ${deployer.address}\n`);

  // Salvar informações do deploy
  const deployInfo = {
    network: network.name,
    chainId: network.chainId,
    bettingPoolAddress: bettingPoolAddress,
    usdcAddress: usdcAddress,
    houseWallet: houseWallet,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  const fs = require("fs");
  fs.writeFileSync(
    "deploy-info.json",
    JSON.stringify(deployInfo, null, 2)
  );

  console.log("💾 Deploy info salvo em deploy-info.json\n");

  // Verificar contrato
  console.log("🔍 Verificando contrato...");
  console.log(`   - Owner: ${await bettingPool.owner()}`);
  console.log(`   - USDC: ${await bettingPool.usdcToken()}`);
  console.log(`   - House Wallet: ${await bettingPool.houseWallet()}`);
  console.log(`   - Match Counter: ${await bettingPool.getMatchCount()}`);
  console.log(`   - Bet Counter: ${await bettingPool.getBetCount()}\n`);

  console.log("✨ Deploy concluído com sucesso!\n");

  // Instruções para verificação no Etherscan
  if (network.chainId === 42161) {
    console.log("📚 Para verificar no Etherscan:");
    console.log(`   https://arbiscan.io/address/${bettingPoolAddress}\n`);
  } else if (network.chainId === 421614) {
    console.log("📚 Para verificar no Arbiscan (Sepolia):");
    console.log(`   https://sepolia.arbiscan.io/address/${bettingPoolAddress}\n`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
