import { createConfig, http } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

const POLYGON_RPC_URL = import.meta.env.VITE_POLYGON_RPC_URL || 'https://polygon-rpc.com';

export const config = createConfig({
  chains: [polygon],
  connectors: [
    injected(),
  ],
  transports: {
    [polygon.id]: http(POLYGON_RPC_URL),
  },
  ssr: false,
});
