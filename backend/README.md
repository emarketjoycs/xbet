# Backend e Oracle - Sistema de Apostas P2P

Backend Node.js com Oracle automático para validação de resultados de partidas esportivas.

## Funcionalidades

- **Oracle Automático**: Verifica resultados de partidas a cada 10 minutos
- **Validação Multi-API**: Consenso entre API-Sports.io e The Odds API
- **API REST**: Endpoints para integração com o frontend
- **Cron Jobs**: Agendamento automático de verificações
- **Event Listening**: Escuta eventos do smart contract em tempo real

## Pré-requisitos

- Node.js 18+
- Conta na API-Sports.io (gratuita)
- Carteira com MATIC para gas fees (oracle)
- Smart contract deployado na Polygon PoS

## Instalação

```bash
# Instalar dependências
npm install

# Copiar arquivo de configuração
# O arquivo .env não é necessário em produção com Railway/Render

# Editar .env com suas credenciais
# As variáveis são configuradas diretamente no painel do serviço de hospedagem.
```

## Configuração

Configure as seguintes variáveis de ambiente no seu serviço de hospedagem (Railway, Render, etc.):

```env
# Blockchain
RPC_URL=https://polygon-rpc.com
CONTRACT_ADDRESS=0x... # Endereço do contrato
ORACLE_PRIVATE_KEY=0x... # Private key da carteira oracle

# APIs
API_SPORTS_KEY=your_key_here
THE_ODDS_API_KEY=your_key_here # Opcional

# Servidor
PORT=3001
```

### Obter API Keys

**API-Sports.io** (Obrigatória):
1. Acesse https://dashboard.api-football.com/register
2. Crie uma conta gratuita
3. Copie sua API key do dashboard
4. Plano gratuito: 100 requisições/dia

**The Odds API** (Opcional):
1. Acesse https://the-odds-api.com/
2. Crie uma conta gratuita
3. Copie sua API key
4. Plano gratuito: 500 créditos/mês

## Uso

### Iniciar Backend + Oracle

```bash
npm start
```

### Modo Desenvolvimento (com auto-reload)

```bash
npm run dev
```

### Apenas Oracle (sem API REST)

```bash
npm run oracle
```

## Endpoints da API

### Health Check
```
GET /health
```

### Partidas Futuras
```
GET /api/matches/future?leagueId=71&season=2024
```

### Odds de uma Partida
```
GET /api/matches/:fixtureId/odds
```

### Resultado de uma Partida
```
GET /api/matches/:fixtureId/result
```

### Partidas de Hoje
```
GET /api/matches/today
```

### Informações de um Mercado
```
GET /api/markets/:marketId
```

### Mercados Ativos
```
GET /api/markets/active
```

### Normalizar Odds (Calcular Seed Virtual)
```
POST /api/odds/normalize
Content-Type: application/json

{
  "home": 2.50,
  "draw": 3.20,
  "away": 2.80,
  "seedAmount": 100
}
```

### Verificação Manual (Testes)
```
POST /api/oracle/check
```

## Como Funciona o Oracle

### Fluxo de Validação

1. **Cron Job** executa a cada 10 minutos
2. **Busca mercados ativos** que já deveriam ter terminado
3. **Consulta APIs** para obter resultados
4. **Verifica consenso** entre as APIs
5. **Define resultado** no smart contract via transação
6. **Distribui prêmios** automaticamente (via smart contract)

### Consenso de Resultados

O oracle requer consenso de pelo menos **2 APIs** antes de definir o resultado:

- Se 2+ APIs concordam → Define resultado
- Se não há consenso → Aguarda próxima verificação
- Se partida cancelada → Invalida mercado

### Exemplo de Log

```
🔍 Verificando mercados pendentes...
📊 2 mercado(s) pendente(s) de validação

🎯 Validando mercado #1
   Flamengo vs Palmeiras
   Liga: Brasileirão Série A
   ✅ API-Sports: home (2-1)
   ✅ The Odds API: home (2-1)
✅ Consenso alcançado: home
   2/2 APIs concordam
📝 Definindo resultado do mercado 1: 0
⏳ Transação enviada: 0x...
✅ Mercado 1 finalizado com sucesso!
```

## Estrutura do Projeto

```
backend/
├── src/
│   ├── config/
│   │   └── config.js          # Configurações
│   ├── services/
│   │   ├── apiSportsService.js    # Integração API-Sports
│   │   ├── theOddsApiService.js   # Integração The Odds API
│   │   ├── contractService.js     # Integração Smart Contract
│   │   └── oracle.js              # Serviço Oracle
│   └── index.js               # Servidor Express
├── package.json
├── .env.example
└── README.md
```

## Segurança

⚠️ **IMPORTANTE:**

- **NUNCA** commite o arquivo `.env` no git
- Mantenha a private key do oracle em segredo
- Use uma carteira dedicada apenas para o oracle
- Monitore o saldo de MATIC da carteira oracle
- Em produção, use serviços como AWS Secrets Manager

## Manutenção

### Monitorar Logs

```bash
# Ver logs em tempo real
npm start

# Logs são exibidos no console
```

### Verificar Saldo da Carteira Oracle

```bash
# Adicione este script em scripts/checkBalance.js
node scripts/checkBalance.js
```

### Recarregar Configuração

Reinicie o servidor após alterar o `.env`:

```bash
# Ctrl+C para parar
npm start
```

## Troubleshooting

### Erro: "Missing required environment variables"

Verifique se o arquivo `.env` existe e contém todas as variáveis obrigatórias.

### Erro: "API-Sports Error: ..."

Verifique se sua API key está correta e se não excedeu o limite diário (100 req/dia).

### Erro: "insufficient funds for gas"

A carteira oracle não tem MATIC suficiente. Envie MATIC para a carteira.

### Oracle não define resultados

- Verifique se as partidas realmente terminaram
- Verifique se as APIs estão retornando resultados
- Verifique os logs para ver se há consenso

## Contribuindo

Para adicionar suporte a novas APIs:

1. Crie um novo serviço em `src/services/`
2. Implemente os métodos `getMatchResult()`
3. Adicione a API em `config.oracle.enabledApis`
4. Atualize `oracle.js` para consultar a nova API

## Licença

MIT
