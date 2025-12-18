
import { defineChain } from 'viem';

export const hemi = defineChain({
  id: 43111,
  name: 'Hemi',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://lb.drpc.live/hemi/ApYJwFP6fUZZiUIeroa5Vo3PdXdHwOcR8JJuQmlfqV1j'],
    },
  },
  blockExplorers: {
    default: { name: 'Hemi Explorer', url: 'https://explorer.hemi.xyz' },
  },
});

export const hemiTestnet = defineChain({
  id: 743111,
  name: 'Hemi Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.rpc.hemi.network/rpc'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://testnet.explorer.hemi.xyz' },
  },
  testnet: true,
});
