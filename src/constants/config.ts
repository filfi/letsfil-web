// import { createPublicClient, custom } from 'viem';
import { QueryClient } from '@tanstack/react-query';
import { publicProvider } from 'wagmi/providers/public';
import { filecoin, filecoinCalibration } from 'viem/chains';
import { Chain, configureChains, createConfig } from 'wagmi';

import { isMainnet } from '@/constants';

// const _chains: Chain[] = [filecoin];
const _chains: Chain[] = isMainnet
  ? [
      {
        ...filecoin,
        rpcUrls: {
          default: {
            http: ['https://api.node.glif.io/rpc/v1', 'https://filfox.info/rpc/v1'],
          },
          public: {
            http: ['https://api.node.glif.io/rpc/v1', 'https://filfox.info/rpc/v1'],
          },
        },
      },
    ]
  : [filecoinCalibration];

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
    },
  },
});

export const safeAmount = isMainnet ? 300 : 3;

export const CREATION_TIME = isMainnet ? 1598306400 : 1667326380;

// const transport = custom(window.ethereum as any, {
//   name: 'Window Ethereum Provider',
// });

export const { chains, publicClient, webSocketPublicClient } = configureChains(_chains, [publicProvider()], {
  retryCount: 50,
  retryDelay: 3_000,
  pollingInterval: 10_000,
  batch: { multicall: true },
});

// const publicClient = createPublicClient({
//   chain: isMainnet ? filecoin : filecoinCalibration,
//   transport,
// });

export const config = createConfig({
  publicClient,
  webSocketPublicClient,
  autoConnect: true,
});

export const defaultWallet = 'MetaMask';

export const blocklist: string[] = [];

export const whitelist: { address: string; limit?: number }[] = [];
