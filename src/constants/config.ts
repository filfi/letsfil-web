import { publicProvider } from 'wagmi/providers/public';
import { filecoin, filecoinCalibration } from 'viem/chains';
import { Chain, configureChains, createConfig } from 'wagmi';

import { RUN_ENV } from '@/constants';

const isMainnet = RUN_ENV === 'main';
const _chains: Chain[] = isMainnet ? [filecoin] : [filecoinCalibration];

const { chains, publicClient, webSocketPublicClient } = configureChains(_chains, [publicProvider()], {
  retryCount: 50,
  retryDelay: 1000 / 60,
  pollingInterval: 10_000,
  batch: { multicall: true },
});

const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
});

export { chains, config, publicClient, webSocketPublicClient };
