import { QueryClient } from '@tanstack/react-query';
import { publicProvider } from 'wagmi/providers/public';
import { filecoin, filecoinCalibration } from 'viem/chains';
import { Chain, configureChains, createConfig } from 'wagmi';

import { isMainnet } from '@/constants';

// const _chains: Chain[] = [filecoin];
const _chains: Chain[] = isMainnet ? [filecoin] : [filecoinCalibration];

export const queryClient = new QueryClient();

export const safeAmount = isMainnet ? 300 : 3;

export const { chains, publicClient, webSocketPublicClient } = configureChains(_chains, [publicProvider()], {
  retryCount: 50,
  retryDelay: 3_000,
  pollingInterval: 10_000,
  batch: { multicall: true },
});

export const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
});

export const defaultWallet = 'MetaMask';

export const blocklist: string[] = ['f02200000'];

export const whitelist: { address: string; limit?: number }[] = [
  { address: '0xa9411db7afb7b23A7dDaAB3aB8e92DEe9186488E', limit: 0 },
  { address: '0x2EfF86B8B7df28B47fA061A0b4B6D2bBBbD8C38d', limit: 0 },
  { address: '0x5c20Da1090E22B313cc660a904F82107f05b6a05', limit: 0 },
  { address: '0x6c7434feb871d105b1ddf613d941c499ee3b36b0', limit: 0 },
];
