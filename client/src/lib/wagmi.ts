import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrum } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'XBET - Decentralized Betting',
  // Seu projectId está configurado corretamente no Netlify.
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID_PLACEHOLDER', 
  
  // A CHAVE PARA A CORREÇÃO: Forçar o uso de um RPC público confiável.
  chains: [
    {
      ...arbitrum,
      // Sobrescrever os URLs RPC padrão para garantir que o wagmi use um endpoint estável.
      rpcUrls: {
        default: { http: ['https://arb1.arbitrum.io/rpc'] },
        public: { http: ['https://arb1.arbitrum.io/rpc'] },
      },
    },
  ],
  ssr: false,
} );
