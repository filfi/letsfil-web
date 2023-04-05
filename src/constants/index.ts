export const DEFAULT_NAME = 'FILFI';

export const defaultLocale = 'zh-CN';

export const API_URL = process.env.API_URL ?? '';

/**
 * Raise Facory Contract Address
 */
// hyperspace - testnet
// export const RAISE_ADDRESS = '0x948448af544a1C0d88f4659946A8840AF258F299';
// 2k - testnet
export const RAISE_ADDRESS = '0x7C6508d43C5C9BbeEC8e6874b48639D18aF5751C';

export const locales = [
  {
    icon: '🇺🇸',
    abbr: 'EN',
    locale: 'en-US',
    label: 'English',
  },
  {
    icon: '🇨🇳',
    abbr: 'CN',
    locale: 'zh-CN',
    label: '简体中文',
  },
];
