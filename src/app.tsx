/**
 * 运行时配置
 */

import App from './components/App';
import { getLocale, setLocale } from '@/utils/storage';

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
export async function getInitialState() {
  return {};
}

export function rootContainer(root?: React.ReactNode) {
  return <App>{root}</App>;
}
