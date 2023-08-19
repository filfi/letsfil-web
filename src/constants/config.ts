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

export const blocklist = ['f02220887'];

export const whitelist = [
  { address: '0x20688564aD8e1204A9Aaf895359eD57a0274185f', limit: 0 },
  { address: '0xEE2BD6C12C5b1AC3b7B40b461EA92de70a926D8b', limit: 0 },
  { address: '0x82BDEbDA0F6EBcaF25157Fdf8208c45b1881f028', limit: 0 },
  { address: '0xC959e19E18093A5D2f3e4a007f32dE863ccfE48A', limit: 0 },
  { address: '0x6c7434feb871d105b1ddf613d941c499ee3b36b0', limit: 0 },
  { address: '0x82BDEbDA0F6EBcaF25157Fdf8208c45b1881f028', limit: 0 },
];
