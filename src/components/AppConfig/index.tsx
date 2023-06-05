import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { filecoin, filecoinCalibration } from 'viem/chains';

import { RUN_ENV } from '@/constants';
const isMainnet = RUN_ENV === 'main';

const { publicClient, webSocketPublicClient } = configureChains([isMainnet ? filecoin : filecoinCalibration], [publicProvider()]);

const config = createConfig({
  publicClient,
  webSocketPublicClient,
});

const AppConfig: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <WagmiConfig config={config}>{children}</WagmiConfig>;
};
export default AppConfig;
