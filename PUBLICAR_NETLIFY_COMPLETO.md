# 🚀 Guia Completo: Publicar DxBet na Netlify com WalletConnect e Smart Contracts

## 📋 Índice

1. [Preparação Inicial](#prepara%C3%A7%C3%A3o-inicial)

1. [Configurar WalletConnect](#configurar-walletconnect)

1. [Preparar Código para Produção](#preparar-c%C3%B3digo-para-produ%C3%A7%C3%A3o)

1. [Publicar na Netlify](#publicar-na-netlify)

1. [Configurar Variáveis de Ambiente](#configurar-vari%C3%A1veis-de-ambiente)

1. [Integrar Smart Contracts](#integrar-smart-contracts)

1. [Testar em Produção](#testar-em-produ%C3%A7%C3%A3o)

---

## 🔧 Preparação Inicial

### Pré-requisitos

- ✅ Conta GitHub ([https://github.com](https://github.com) )

- ✅ Conta Netlify ([https://app.netlify.com](https://app.netlify.com) )

- ✅ WalletConnect Project ID ([https://cloud.walletconnect.com](https://cloud.walletconnect.com) )

- ✅ Código do DxBet extraído

- ✅ Node.js 18+ instalado

---

## 🔐 Configurar WalletConnect

### Passo 1: Obter WalletConnect Project ID

1. **Acesse:** [https://cloud.walletconnect.com](https://cloud.walletconnect.com)

1. **Clique em:** "Sign Up" ou "Sign In"

1. **Crie novo projeto:**

- Nome: "DxBet"

- Descrição: "Decentralized Betting Platform"

1. **Copie o Project ID** (exemplo: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` )

### Passo 2: Preparar Arquivo de Configuração

Edite `client/src/lib/wagmi.ts`:

```typescript
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrum } from 'wagmi/chains';

// ⚠️ IMPORTANTE: Use variável de ambiente em produção!
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

export const config = getDefaultConfig({
  appName: 'DxBet - Decentralized Betting',
  projectId: projectId,
  chains: [arbitrum],
  ssr: false,
});
```

### Passo 3: Criar Arquivo .env.local (Desenvolvimento)

Crie arquivo `.env.local` na raiz do projeto:

```
# WalletConnect
VITE_WALLETCONNECT_PROJECT_ID=seu_project_id_aqui

# Smart Contract (será preenchido depois)
VITE_BETTING_CONTRACT_ADDRESS=0x...
VITE_BETTING_CONTRACT_ABI=...
```

**⚠️ NÃO COMMITE este arquivo no GitHub!**

---

## 🏗️ Preparar Código para Produção

### Passo 1: Atualizar package.json

Verifique se `package.json` tem:

```json
{
  "name": "dxbet",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host",
    "build": "vite build",
    "preview": "vite preview --host",
    "check": "tsc --noEmit"
  }
}
```

### Passo 2: Criar .gitignore

Crie arquivo `.gitignore` na raiz:

```
# Ambiente
.env
.env.local
.env.*.local

# Dependências
node_modules/
pnpm-lock.yaml

# Build
dist/
.vite/

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db
```

### Passo 3: Testar Build Localmente

```bash
pnpm install
pnpm run build
pnpm run preview
```

Verifique se funciona em [http://localhost:4173](http://localhost:4173)

---

## 📤 Publicar na Netlify

### Opção 1: Deploy Automático com GitHub (Recomendado )

#### Passo 1: Fazer Push para GitHub

```bash
# Inicializar git (se não tiver)
git init
git add .
git commit -m "Initial commit: DxBet platform"

# Criar repositório no GitHub
# https://github.com/new

# Fazer push
git remote add origin https://github.com/seu-usuario/dxbet.git
git branch -M main
git push -u origin main
```

#### Passo 2: Conectar Netlify com GitHub

1. **Acesse:** [https://app.netlify.com](https://app.netlify.com)

1. **Clique em:** "Add new site" → "Import an existing project"

1. **Selecione:** "GitHub"

1. **Autorize Netlify** a acessar sua conta GitHub

1. **Selecione repositório:** `dxbet`

1. **Configure build:**

```
Build command:    pnpm run build
Publish directory: dist
```

1. **Clique em:** "Deploy site"

#### Passo 3: Configurar Variáveis de Ambiente

1. **Na Netlify, vá para:** Site settings → Build & deploy → Environment

1. **Clique em:** "Edit variables"

1. **Adicione:**

```
VITE_WALLETCONNECT_PROJECT_ID = seu_project_id_aqui
```

1. **Salve e redeploy**

---

### Opção 2: Deploy Manual (Mais Rápido )

#### Passo 1: Compilar Localmente

```bash
pnpm run build
# Cria pasta dist/
```

#### Passo 2: Fazer Upload na Netlify

1. **Acesse:** [https://app.netlify.com](https://app.netlify.com)

1. **Clique em:** "Add new site" → "Deploy manually"

1. **Arraste a pasta ****`dist/`**** para upload**

1. **Espere terminar**

1. **Seu site estará em:** `https://seu-site-aleatorio.netlify.app`

#### Passo 3: Configurar Domínio Customizado

1. **Na Netlify, vá para:** Site settings → Domain management

1. **Clique em:** "Add custom domain"

1. **Digite:** `dxbet.com` (ou seu domínio )

1. **Aponte DNS** do seu domínio para Netlify

1. **Ative HTTPS** automático

---

## 🔑 Configurar Variáveis de Ambiente

### Na Netlify Dashboard

1. **Vá para:** Site settings → Build & deploy → Environment

1. **Clique em:** "Edit variables"

1. **Adicione as variáveis:**

```
# WalletConnect
VITE_WALLETCONNECT_PROJECT_ID = a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

# Smart Contract (será preenchido depois)
VITE_BETTING_CONTRACT_ADDRESS = 0x...
VITE_BETTING_CONTRACT_ABI = [...]

# Arbitrum RPC (opcional, se usar seu próprio)
VITE_ARBITRUM_RPC_URL = https://arb1.arbitrum.io/rpc

# Analytics (opcional  )
VITE_ANALYTICS_ENABLED = true
```

### Acessar Variáveis no Código

```typescript
// Em qualquer arquivo React
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const contractAddress = import.meta.env.VITE_BETTING_CONTRACT_ADDRESS;
```

---

## 🔗 Integrar Smart Contracts

### Passo 1: Atualizar useBettingContract Hook

Edite `client/src/hooks/useBettingContract.ts`:

```typescript
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { parseUnits } from 'viem';

const CONTRACT_ADDRESS = import.meta.env.VITE_BETTING_CONTRACT_ADDRESS as `0x${string}`;
const CONTRACT_ABI = JSON.parse(import.meta.env.VITE_BETTING_CONTRACT_ABI || '[]');

export function useBettingContract() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  return {
    // Buscar saldo do usuário
    getUserBalance: async () => {
      if (!address || !publicClient) return '0';
      try {
        const balance = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'balanceOf',
          args: [address],
        });
        return balance.toString();
      } catch (error) {
        console.error('Erro ao buscar saldo:', error);
        return '0';
      }
    },

    // Colocar aposta
    placeBet: async (matchId: number, outcome: number, amount: string) => {
      if (!walletClient || !address) throw new Error('Carteira não conectada');
      
      try {
        const tx = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'placeBet',
          args: [matchId, outcome, parseUnits(amount, 6)], // USDC tem 6 decimais
          account: address,
        });
        return tx;
      } catch (error) {
        console.error('Erro ao colocar aposta:', error);
        throw error;
      }
    },

    // Sacar ganhos
    claimWinnings: async (betId: number) => {
      if (!walletClient || !address) throw new Error('Carteira não conectada');
      
      try {
        const tx = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'claimWinnings',
          args: [betId],
          account: address,
        });
        return tx;
      } catch (error) {
        console.error('Erro ao sacar ganhos:', error);
        throw error;
      }
    },

    // Obter odds
    getOdds: async (matchId: number) => {
      if (!publicClient) return { yes: '0', no: '0', draw: '0' };
      try {
        const odds = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getOdds',
          args: [matchId],
        });
        return odds;
      } catch (error) {
        console.error('Erro ao obter odds:', error);
        return { yes: '0', no: '0', draw: '0' };
      }
    },
  };
}
```

### Passo 2: Usar Hook em Componentes

Exemplo em `Dashboard.tsx`:

```typescript
import { useBettingContract } from '@/hooks/useBettingContract';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { getUserBalance, claimWinnings } = useBettingContract();
  const [balance, setBalance] = useState('0');

  useEffect(() => {
    getUserBalance().then(setBalance);
  }, []);

  return (
    <div>
      <h1>Saldo: {balance} USDC</h1>
      <button onClick={() => claimWinnings(1)}>
        Sacar Ganhos
      </button>
    </div>
  );
}
```

### Passo 3: Adicionar ABI do Contrato

Quando tiver o smart contract pronto:

1. **Copie a ABI** do contrato compilado

1. **Crie arquivo** `client/src/lib/betting-abi.json`:

```json
[
  {
    "inputs": [
      { "name": "matchId", "type": "uint256" },
      { "name": "outcome", "type": "uint8" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "placeBet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // ... mais funções
]
```

1. **Importe em useBettingContract.ts**:

```typescript
import CONTRACT_ABI from '@/lib/betting-abi.json';
```

---

## ✅ Testar em Produção

### Passo 1: Verificar Variáveis de Ambiente

Acesse seu site e abra o console (F12):

```javascript
// No console do navegador
console.log(import.meta.env.VITE_WALLETCONNECT_PROJECT_ID)
// Deve mostrar seu Project ID
```

### Passo 2: Testar Conexão com Carteira

1. **Acesse seu site na Netlify**

1. **Clique em "Connect Wallet"**

1. **Selecione sua carteira** (MetaMask, Rabby, etc)

1. **Confirme a conexão**

1. **Você deve ser redirecionado para ****`/dashboard`**

### Passo 3: Testar Smart Contract (Testnet)

1. **Mude para Arbitrum Sepolia** (testnet) na sua carteira

1. **Obtenha ETH testnet** em [https://faucet.arbitrum.io](https://faucet.arbitrum.io)

1. **Deploy seu contrato em testnet**

1. **Atualize VITE_BETTING_CONTRACT_ADDRESS** em Netlify

1. **Teste as funções** (placeBet, claimWinnings, etc )

### Passo 4: Monitorar Erros

Na Netlify:

1. **Vá para:** Analytics → Logs

1. **Veja erros em tempo real**

1. **Corrija conforme necessário**

---

## 🔄 Fluxo de Desenvolvimento

### Desenvolvimento Local

```bash
pnpm run dev
# http://localhost:5173
```

### Testar Build

```bash
pnpm run build
pnpm run preview
# http://localhost:4173
```

### Publicar em Produção

```bash
git add .
git commit -m "Update features"
git push origin main
# Netlify faz deploy automático!
```

---

## 📝 Checklist de Publicação

### Antes de Publicar

- [ ] WalletConnect Project ID obtido

- [ ] Código testado localmente (`pnpm run dev` )

- [ ] Build testado (`pnpm run build`)

- [ ] `.env.local` criado com Project ID

- [ ] `.gitignore` criado (não commitar .env)

- [ ] Repositório GitHub criado

### Ao Publicar na Netlify

- [ ] Repositório conectado ao Netlify

- [ ] Build command: `pnpm run build`

- [ ] Publish directory: `dist`

- [ ] Variáveis de ambiente configuradas

- [ ] HTTPS ativado

- [ ] Domínio customizado apontado (opcional)

### Após Publicação

- [ ] Site acessível

- [ ] Conexão com carteira funciona

- [ ] WalletConnect Project ID carregado

- [ ] Sem erros no console

- [ ] Responsivo em mobile

### Integração com Smart Contract

- [ ] Smart contract desenvolvido

- [ ] Smart contract auditado

- [ ] Smart contract deployado em testnet

- [ ] ABI adicionada ao projeto

- [ ] Endereço do contrato configurado

- [ ] Funções testadas

---

## 🆘 Troubleshooting

### Problema: "WalletConnect Project ID not found"

**Solução:**

1. Verifique se variável está em Netlify (Site settings → Environment)

1. Redeploy o site

1. Limpe cache do navegador (Ctrl+Shift+Delete)

### Problema: "Carteira não conecta"

**Solução:**

1. Verifique se Project ID está correto

1. Teste em [http://localhost:5173](http://localhost:5173) primeiro

1. Verifique se carteira está na rede Arbitrum One

### Problema: "Erro ao chamar smart contract"

**Solução:**

1. Verifique se endereço do contrato está correto

1. Verifique se ABI está correta

1. Teste em testnet primeiro

1. Verifique logs no console (F12 )

### Problema: "Build falha na Netlify"

**Solução:**

1. Verifique logs de build em Netlify

1. Teste build localmente: `pnpm run build`

1. Verifique se `package.json` está correto

1. Verifique se todas as dependências estão instaladas

---

## 📚 Recursos Úteis

| Recurso | URL |
| --- | --- |
| Netlify Docs | [https://docs.netlify.com](https://docs.netlify.com) |
| WalletConnect Docs | [https://docs.walletconnect.com](https://docs.walletconnect.com) |
| Wagmi Docs | [https://wagmi.sh](https://wagmi.sh) |
| RainbowKit Docs | [https://www.rainbowkit.com](https://www.rainbowkit.com) |
| Arbitrum Docs | [https://docs.arbitrum.io](https://docs.arbitrum.io) |
| Viem Docs | [https://viem.sh](https://viem.sh) |

---

## 🎯 Próximos Passos

1. **Configurar WalletConnect** (5 min )

1. **Fazer push para GitHub** (5 min)

1. **Conectar Netlify** (5 min)

1. **Configurar variáveis de ambiente** (5 min)

1. **Testar em produção** (15 min)

1. **Desenvolver smart contract** (2-4 semanas)

1. **Integrar smart contract** (2-3 dias)

1. **Deploy em mainnet** (1 dia)

---

**Versão:** 1.0**Data:** Dezembro 2024**Status:** ✅ Pronto para Publicação

