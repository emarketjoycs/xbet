import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrum } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'XBET - Decentralized Betting',
  projectId: 'YOUR_PROJECT_ID', // Em produção, isso deve vir de uma variável de ambiente
  chains: [arbitrum],
  ssr: false, // Como é um app client-side (Vite), SSR não é necessário
});
