import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrum } from 'wagmi/chains';
import { http } from 'viem'; // Importar o http para configurar o transporte RPC

// A função getDefaultConfig é conveniente, mas para garantir a leitura do saldo,
// vamos usar uma configuração mais explícita, garantindo um RPC.

export const config = getDefaultConfig({
  appName: 'XBET - Decentralized Betting',
  // O projectId é essencial para o RainbowKit/Wagmi funcionar corretamente (RPCs e metadados ).
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID_PLACEHOLDER', 
  
  // A chave para a correção: Forçar o uso de um RPC público confiável.
  chains: [
    {
      ...arbitrum,
      // Adicionar um transporte HTTP explícito para garantir a leitura do saldo.
      // Você pode usar um RPC público ou, preferencialmente, um RPC privado do Alchemy/Infura.
      // O endpoint padrão do wagmi/chains é usado se o http( ) não for fornecido,
      // mas explicitá-lo com um endpoint confiável resolve problemas de "NaN".
      // Se o problema persistir, substitua o 'https://arb1.arbitrum.io/rpc' por um RPC de sua preferência.
      rpcUrls: {
        default: { http: ['https://arb1.arbitrum.io/rpc'] },
        public: { http: ['https://arb1.arbitrum.io/rpc'] },
      },
    },
  ],
  ssr: false,
} );
