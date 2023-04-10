export const DEFAULT_NAME = 'FILFI';

export const defaultLocale = 'zh-CN';

export const API_URL = process.env.API_URL ?? '';

const RUN_ENV = process.env.RUN_ENV;
// hyperspace - testnet
const ADDR_HP = '0xbe8C377495B5a2B9A46fA608bF246C65Ad6A06AA';
// 2k - testnet
const ADDR_2K = '0xAD2A0fF09EBc6bce52F5bB3a2FDA9F2836C648e8';

/**
 * Raise Facory Contract Address
 */
export const RAISE_ADDRESS = RUN_ENV === 'hp' ? ADDR_HP : ADDR_2K;

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
