/**
 * 运行时配置
 */

import { publicProvider } from 'wagmi/providers/public';
import { filecoin, filecoinCalibration } from 'viem/chains';
import { WagmiConfig, configureChains, createConfig } from 'wagmi';

import { RUN_ENV } from '@/constants';
import { getInitState, getLocale, setLocale } from '@/utils/storage';

const isMainnet = RUN_ENV === 'main';

/**
 * @see https://v3.umijs.org/zh-CN/plugins/plugin-locale#%E8%BF%90%E8%A1%8C%E6%97%B6%E9%85%8D%E7%BD%AE
 */
export const locale = {
  getLocale,
  setLocale({ lang, realReload, updater }: { lang: string; realReload: boolean; updater: () => void }) {
    setLocale(lang);

    if (realReload) {
      window.location.reload();
    }

    updater?.();
  },
};

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://next.umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<InitState> {
  let state = getInitState();
  const chainId = window.ethereum?.chainId;

  return {
    chainId,
    accounts: [],
    connected: false,
    ...state,
    connecting: false,
    processing: false,
  };
}

const { publicClient, webSocketPublicClient } = configureChains([isMainnet ? filecoin : filecoinCalibration], [publicProvider()]);

const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
});

export function rootContainer(root?: React.ReactNode) {
  return <WagmiConfig config={config}>{root}</WagmiConfig>;
}
