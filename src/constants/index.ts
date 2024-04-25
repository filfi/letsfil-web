export const NET_ENV = process.env.NET_ENV;
export const RUN_ENV = process.env.RUN_ENV;
export const API_URL = process.env.API_URL;
export const RPC_URL = process.env.RPC_URL;

/**
 * 工厂合约地址
 */
export const ADDR_FACTORY = process.env.ADDR_FACTORY;
/**
 * aFil通证合约地址
 */
export const ADDR_AFIL = process.env.ADDR_AFIL;
/**
 * aFil借贷合约地址
 */
export const ADDR_LOAN = process.env.ADDR_LOAN;
/**
 * Retriever合约地址
 */
export const ADDR_RETRIEVER = process.env.ADDR_RETRIEVER;

console.log('[ENV]: ', {
  ...process.env,
  UMI_ENV: process.env.UMI_ENV,
  NET_ENV: process.env.NET_ENV,
  RUN_ENV: process.env.RUN_ENV,
  API_URL: process.env.API_URL,
  RPC_URL: process.env.RPC_URL,
  ADDR_FACTORY: process.env.ADDR_FACTORY,
  ADDR_AFIL: process.env.ADDR_AFIL,
  ADDR_LOAN: process.env.ADDR_LOAN,
  ADDR_RETRIEVER: process.env.ADDR_RETRIEVER,
});

export const defaultLocale = 'zh-CN';

export const isMainnet = NET_ENV === 'main';

export const SUPPORTED_CHAINS = isMainnet
  ? [
      '0x13a', // 314, // Filecoin - Mainnet
    ]
  : [
      /**
       * Filecoin testnet
       */
      // '0xc45', // 3141, // Hypersapce testnet
      '0x4cb2f', // 314159, // Calibration testnet
    ];

const SCAN_URL_MAIN = 'https://filfox.info/en'; // mainnet
// const SCAN_URL_CB = 'https://calibration.filscan.io'; // calibration testnet
const SCAN_URL_CB = 'https://calibration.filfox.info/en'; // calibration testnet
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
