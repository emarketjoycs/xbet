'''
import { createConfig, http } from 'wagmi';
import { arbitrum } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

const ARBITRUM_RPC_URL = import.meta.env.VITE_ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc';

export const config = createConfig({
  chains: [arbitrum],
  connectors: [
    injected(),
  ],
  transports: {
    [arbitrum.id]: http(ARBITRUM_RPC_URL),
  },
  ssr: false,
});
'''
