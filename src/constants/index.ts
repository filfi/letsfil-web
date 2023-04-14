export const DEFAULT_NAME = "Let's Fil";

export const defaultLocale = 'zh-CN';

export const RUN_ENV = process.env.RUN_ENV;

export const API_URL = process.env.API_URL ?? '';

export const RPC_URL = process.env.RPC_URL ?? '';

// hyperspace - testnet
const ADDR_HP = '0x2921c393f4bC2bAd5f674A0672e75493A2e2D508';
// 2k - testnet
const ADDR_2K = '0x04Cf4781A179c8dAE96EF91f958222BFE6cFC503';
/**
 * Raise Facory Contract Address
 */
export const RAISE_ADDRESS = RUN_ENV === 'hp' ? ADDR_HP : ADDR_2K;

console.log('[RUN_ENV]: ', RUN_ENV);

const SCAN_URL_MAIN = 'https://filfox.info/en/address';
const SCAN_URL_HP = 'https://hyperspace.filfox.info/en/address';
/**
 * Miner Overview address
 */
export const SCAN_URL = RUN_ENV === 'hp' ? SCAN_URL_HP : SCAN_URL_MAIN;

export const SUPPORTED_CHAINS = [
  '0x13a', // 314, // Filecoin - Mainnet
  '0xc45', // 3141, // hypersapce testnet
  '0x1df5e76', // 31415926, // 2k - local testnet
];

export const sectors = [32, 64];
export const periods = [90, 120, 180, 240, 360, 540];
export const planStatusText = ['未缴纳募集保证金', '未缴纳运维保证金', '等待服务商签名', '募集进行中', '计划已关闭', '募集成功', '募集失败'];

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
