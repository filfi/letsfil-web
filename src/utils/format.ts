import dayjs from 'dayjs';
import numeral from 'numeral';
import { ethers } from 'ethers';
import { BigNumber } from 'bignumber.js';

export function formatNum(num: number | string, fmt: string, runding?: numeral.RoundingFunction) {
  return numeral(num).format(fmt, runding);
}

export function formatByte(byte: number | string, fmt = '0b') {
  return formatNum(byte, fmt);
}

export function formatRate(rate: number | string, fmt = '0%') {
  return formatNum(rate, fmt);
}

export function formatUnix(date: number, fmt = 'YYYY-MM-DD HH:mm') {
  return dayjs(date * 1000).format(fmt);
}

export function formatAddr(addr?: unknown) {
  if (typeof addr === 'string') {
    return addr.slice(0, 6) + '......' + addr.slice(-4);
  }

  return '';
}

export function toNumber(amount?: ethers.BigNumber | string | number) {
  return BigNumber(ethers.utils.formatEther(amount ?? '0')).toNumber();
}

export function formatAmount(amount?: BigNumber.Value, decimalPlaces = 4) {
  return BigNumber(amount ?? 0).toFormat(decimalPlaces, BigNumber.ROUND_HALF_EVEN);
}

export function formatEther(amount?: ethers.BigNumber | string | number, decimalPlaces?: number) {
  return formatAmount(ethers.utils.formatEther(amount ?? '0'), decimalPlaces);
}

export function formatDate(date: number | string | Date | dayjs.Dayjs, fmt = 'YYYY-MM-DD HH:mm') {
  return dayjs(date).format(fmt);
}
