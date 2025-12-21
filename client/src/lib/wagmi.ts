import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { metaMaskWallet, walletConnectWallet, rainbowWallet, coinbaseWallet } from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
import { arbitrum } from 'wagmi/chains';

const ARBITRUM_RPC_URL = import.meta.env.VITE_ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recomendadas',
      wallets: [
        metaMaskWallet,
        rainbowWallet,
        coinbaseWallet,
        walletConnectWallet,
      ],
    },
  ],
  {
    appName: 'XBET - Decentralized Betting',
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID_PLACEHOLDER',
  }
);

export const config = createConfig({
  connectors,
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
