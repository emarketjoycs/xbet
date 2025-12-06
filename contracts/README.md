# 🎰 DxBet Smart Contracts

Smart contracts para a plataforma de apostas descentralizada DxBet.

## 📋 Visão Geral

O sistema consiste em um smart contract principal (`BettingPool.sol`) que gerencia:

- **Criação de Partidas:** Owner cria partidas de futebol
- **Apostas P2P:** Usuários apostam em 3 resultados (Vitória A, Empate, Vitória B)
- **Cálculo de Odds:** Sistema Pari-Mutuel em tempo real
- **Taxa da Casa:** 2% dos lucros do vencedor
- **Reembolso:** Partidas canceladas reembolsam automaticamente
- **Segurança:** ReentrancyGuard, Pausable, Ownership

## 🏗️ Arquitetura

```
BettingPool.sol
├── Match Management
│   ├── createMatch()
│   ├── setMatchResult()
│   └── cancelMatch()
├── Betting System
│   ├── placeBet()
│   ├── getOdds()
│   └── calculateWinnings()
├── Withdrawals (Pull Payment)
│   ├── claimWinnings()
│   ├── withdraw()
│   └── withdrawHouseFees()
└── Security
    ├── ReentrancyGuard
    ├── Pausable
    └── Ownership
```

## 🚀 Começar

### Pré-requisitos

- Node.js 16+
- npm ou yarn
- Hardhat

### Instalação

```bash
cd contracts
npm install
```

### Compilar

```bash
npm run compile
```

### Testes

```bash
# Rodar todos os testes
npm run test

# Rodar com watch mode
npm run test:watch
```

### Deploy em Testnet

```bash
# Arbitrum Sepolia (testnet)
npm run deploy:sepolia
```

### Deploy em Mainnet

```bash
# Arbitrum One (mainnet)
# ⚠️ Certifique-se de ter testado em testnet primeiro!
npm run deploy:mainnet
```

## 📝 Variáveis de Ambiente

Crie um arquivo `.env` baseado em `.env.example`:

```bash
cp .env.example .env
```

Preencha com:

- `PRIVATE_KEY` - Sua chave privada (testnet ou mainnet)
- `ARBITRUM_SEPOLIA_RPC` - RPC do Arbitrum Sepolia (opcional)
- `ARBITRUM_ONE_RPC` - RPC do Arbitrum One (opcional)
- `ARBISCAN_API_KEY` - Para verificação de contrato

## 🧪 Testes

### Cobertura de Testes

- ✅ Deployment
- ✅ Criação de Partidas
- ✅ Colocação de Apostas
- ✅ Cálculo de Odds
- ✅ Definição de Resultado
- ✅ Cálculo de Ganhos (com taxa de 2%)
- ✅ Reembolso de Partidas Canceladas
- ✅ Saque de Ganhos
- ✅ Saque de Taxas da Casa
- ✅ Pausable (emergência)
- ✅ Segurança contra Reentrancy

### Rodar Testes

```bash
npm run test
```

## 📊 Fórmula de Odds (Pari-Mutuel)

```
Total de Apostas = A + B + C

Odds para A = (Total) / A
Odds para B = (Total) / B
Odds para C = (Total) / C

Ganho do Vencedor = Aposta × Odds - Taxa (2%)
```

### Exemplo

```
Apostas:
- Time A: 1000 USDC
- Empate: 500 USDC
- Time B: 500 USDC
- Total: 2000 USDC

Se Time A vencer:
- Odds para A = 2000 / 1000 = 2.0x
- Ganho bruto = 1000 × 2.0 = 2000 USDC
- Lucro = 2000 - 1000 = 1000 USDC
- Taxa (2%) = 1000 × 0.02 = 20 USDC
- Ganho líquido = 2000 - 20 = 1980 USDC
```

## 🔐 Segurança

### Implementado

- ✅ **ReentrancyGuard** - Previne ataques reentrancy
- ✅ **Pausable** - Pausar contrato em emergência
- ✅ **Ownership** - Apenas owner pode fazer certas ações
- ✅ **Validações** - Verificar entrada de dados
- ✅ **PullPayment** - Usuários sacam (não push)
- ✅ **Limites** - Máximo por aposta, por usuário

### Recomendações

1. **Auditoria Profissional** - Antes de mainnet
2. **Testes em Testnet** - Com usuários reais
3. **Limites Iniciais** - Começar com baixos limites
4. **Monitoramento** - Acompanhar atividade
5. **Fundo de Seguro** - Para cobrir bugs

## 📚 Funções Principais

### Owner Functions

```solidity
// Criar partida
createMatch(string homeTeam, string awayTeam, uint256 startTime)

// Definir resultado
setMatchResult(uint256 matchId, BetOutcome result)

// Cancelar partida
cancelMatch(uint256 matchId)

// Pausar contrato
pause()

// Retomar contrato
unpause()
```

### User Functions

```solidity
// Colocar aposta
placeBet(uint256 matchId, BetOutcome outcome, uint256 amount)

// Sacar ganhos
claimWinnings(uint256 betId)

// Sacar saldo
withdraw()
```

### View Functions

```solidity
// Obter odds em tempo real
getOdds(uint256 matchId)

// Obter dados da partida
getMatch(uint256 matchId)

// Obter dados da aposta
getBet(uint256 betId)

// Obter apostas do usuário
getUserBets(address user)

// Obter saldo do usuário
getUserBalance(address user)
```

## 🌐 Redes Suportadas

### Testnet

- **Arbitrum Sepolia**
  - Chain ID: 421614
  - USDC: `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`
  - RPC: `https://sepolia-rollup.arbitrum.io:443`

### Mainnet

- **Arbitrum One**
  - Chain ID: 42161
  - USDC: `0xFF970A61A04b1cA14834A43f5dE4533eBDDB5F86`
  - RPC: `https://arb1.arbitrum.io/rpc`

## 📖 Verificação no Etherscan

Após deploy, verifique o contrato:

```bash
npm run verify -- <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## 🔗 Integração com Frontend

O frontend se conecta via:

1. **Hook:** `useBettingContract()` em `client/src/hooks/`
2. **ABI:** Importada do contrato compilado
3. **Endereço:** Configurado em variáveis de ambiente

Veja `BACKEND_INTEGRATION.md` para detalhes.

## 📝 Roadmap

- [x] Desenvolvimento do contrato
- [x] Testes automatizados
- [ ] Deploy em Sepolia (testnet)
- [ ] Testes com usuários reais
- [ ] Auditoria profissional
- [ ] Deploy em Arbitrum One (mainnet)

## 🆘 Troubleshooting

### Erro: "USDC transfer failed"

- Verificar se USDC foi aprovado (approve)
- Verificar saldo de USDC
- Verificar endereço do contrato

### Erro: "Match already started"

- Verificar se a partida já começou
- Usar timestamp futuro

### Erro: "Not authorized"

- Apenas owner pode fazer certas ações
- Verificar se está conectado com a carteira correta

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no GitHub.

## 📄 Licença

MIT

---

**Versão:** 1.0  
**Data:** Dezembro 2024  
**Status:** ✅ Pronto para Testnet
