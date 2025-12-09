import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrum } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'XBET - Decentralized Betting',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID_PLACEHOLDER', // O projectId é essencial para o RainbowKit/Wagmi funcionar corretamente (RPCs e metadados).
  chains: [arbitrum],
  ssr: false, // Como é um app client-side (Vite), SSR não é necessário
});
