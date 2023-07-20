export const ADDRESS = process.env.ADDRESS ?? '';

export const API_URL = process.env.API_URL ?? '/api';

export const RPC_URL = process.env.RPC_URL ?? '/rpc';

export const RUN_ENV = process.env.RUN_ENV ?? 'test';

console.log('[RUN_ENV]: ', RUN_ENV);

export const defaultLocale = 'zh-CN';

export const isMainnet = ['main', 'staging'].includes(RUN_ENV);

export const SUPPORTED_CHAINS = isMainnet
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
const RAISE_ADDR = '0x390CB629D5057AB6F990471a725179FdfB64dEFD'; // 5000
/**
 * Raise Facory Contract Address
 */
export const RAISE_ADDRESS = (isMainnet ? ADDRESS : RAISE_ADDR) as API.Address;

const SCAN_URL_MAIN = 'https://filfox.info/en'; // mainnet
const SCAN_URL_CB = 'https://calibration.filscan.io'; // calibration testnet
/**
 * Miner Overview address
 */
export const SCAN_URL = isMainnet ? SCAN_URL_MAIN : SCAN_URL_CB;

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
