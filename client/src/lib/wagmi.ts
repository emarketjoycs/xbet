import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrum } from 'wagmi/chains';

// 1. Obter o RPC dedicado da variável de ambiente (se configurado)
const ARBITRUM_RPC_URL = import.meta.env.VITE_ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc';

export const config = getDefaultConfig({
  appName: 'XBET - Decentralized Betting',
  // O projectId é essencial para o RainbowKit/Wagmi funcionar corretamente (RPCs e metadados ).
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID_PLACEHOLDER', 
  
  chains: [
    {
      ...arbitrum,
      // 2. Usar o RPC dedicado ou o RPC público para garantir a estabilidade
      rpcUrls: {
        default: { http: [ARBITRUM_RPC_URL] },
        public: { http: [ARBITRUM_RPC_URL] },
      },
    },
  ],
  ssr: false,
} );
