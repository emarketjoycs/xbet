import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrum } from 'wagmi/chains';

const ARBITRUM_RPC_URL = import.meta.env.VITE_ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc';

export const config = getDefaultConfig({
  appName: 'XBET - Decentralized Betting',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID_PLACEHOLDER',
  chains: [
    {
      ...arbitrum,
      rpcUrls: {
        default: { http: [ARBITRUM_RPC_URL] },
        public: { http: [ARBITRUM_RPC_URL] },
      },
    },
  ],
  ssr: false,
});
