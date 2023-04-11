export const DEFAULT_NAME = "Let's Fil";

export const defaultLocale = 'zh-CN';

export const RUN_ENV = process.env.RUN_ENV;

export const API_URL = process.env.API_URL ?? '';

export const RPC_URL = process.env.RPC_URL ?? '';

// hyperspace - testnet
const ADDR_HP = '0x6e885C8f5bAE22892BBCc89E1B1C156079741bDE';
// 2k - testnet
const ADDR_2K = '0x04Cf4781A179c8dAE96EF91f958222BFE6cFC503';
/**
 * Raise Facory Contract Address
 */
export const RAISE_ADDRESS = RUN_ENV === 'hp' ? ADDR_HP : ADDR_2K;

console.log('[RUN_ENV]: ', RUN_ENV);

export const SUPPORTED_CHAINS = [
  '0x13a', // 314, // Filecoin - Mainnet
  '0xc45', // 3141, // hypersapce testnet
  '0x1df5e76', // 31415926, // 2k - local testnet
];

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
