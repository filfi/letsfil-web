export const ADDRESS = process.env.ADDRESS ?? '';

export const API_URL = process.env.API_URL ?? '/api';

export const RPC_URL = process.env.RPC_URL ?? '/rpc';

export const RUN_ENV = process.env.RUN_ENV ?? 'test';

console.log('[RUN_ENV]: ', RUN_ENV);

export const defaultLocale = 'zh-CN';

export const SUPPORTED_CHAINS =
  RUN_ENV === 'main'
    ? [
        '0x13a', // 314, // Filecoin - Mainnet
      ]
    : [
        // '0x13a', // 314, // Filecoin Mainnet
        // '0xc45', // 3141, // Hypersapce testnet
        '0x4cb2f', // 314159, // Calibration testnet
      ];

// Calibration testnet
// const RAISE_ADDR = '0x30d10A82a29A367bD403bB2139d8994333550F80'; // 5200
const RAISE_ADDR = '0x9ca619b2E4729c1E659E20A78D026192b29C85ee'; // 5000
/**
 * Raise Facory Contract Address
 */
export const RAISE_ADDRESS = (RUN_ENV === 'main' ? ADDRESS : RAISE_ADDR) as API.Address;

const SCAN_URL_MAIN = 'https://filfox.info/en'; // mainnet
const SCAN_URL_CB = 'https://calibration.filscan.io'; // calibration testnet
/**
 * Miner Overview address
 */
export const SCAN_URL = RUN_ENV === 'main' ? SCAN_URL_MAIN : SCAN_URL_CB;

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
