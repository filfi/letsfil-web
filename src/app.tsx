/**
 * 运行时配置
 */

import MetaMaskOnboarding from '@metamask/onboarding';

import { getInitState, getLocale, setLocale } from '@/utils/storage';

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

  if (state?.connected && MetaMaskOnboarding.isMetaMaskInstalled()) {
    state.accounts = await window.ethereum!.request({ method: 'eth_requestAccounts' });

    state.chainId = await window.ethereum!.request({ method: 'eth_chainId' });
  }

  return {
    accounts: [],
    connected: false,
    ...state,
    connecting: false,
    processing: false,
  };
}
