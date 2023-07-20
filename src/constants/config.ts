import { QueryClient } from '@tanstack/react-query';
import { publicProvider } from 'wagmi/providers/public';
import { filecoin, filecoinCalibration } from 'viem/chains';
import { Chain, configureChains, createConfig } from 'wagmi';

import { isMainnet } from '@/constants';

// const _chains: Chain[] = [filecoin];
const _chains: Chain[] = isMainnet ? [filecoin] : [filecoinCalibration];

export const queryClient = new QueryClient();

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
