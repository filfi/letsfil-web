import dayjs from 'dayjs';
import numeral from 'numeral';
import { ethers } from 'ethers';
import { BigNumber } from 'bignumber.js';

export function formatNum(num: number | string, fmt: string, runding?: numeral.RoundingFunction) {
  return numeral(num).format(fmt, runding);
}

export function formatByte(byte: number | string, fmt = '0ib') {
  return formatNum(byte, fmt).replace(/iB$/, 'B');
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

export function toNumber(amount?: ethers.BigNumberish, unitName: ethers.BigNumberish = 18) {
  return BigNumber(ethers.utils.formatUnits(`${amount || '0'}`, unitName)).toNumber();
}

export function formatAmount(amount?: BigNumber.Value, decimalPlaces = 4) {
  return BigNumber(amount ?? 0).toFormat(decimalPlaces, BigNumber.ROUND_HALF_EVEN);
}

export function formatEther(amount?: ethers.BigNumberish, decimalPlaces?: number) {
  return formatAmount(toNumber(amount), decimalPlaces);
}

export function formatDate(date: number | string | Date | dayjs.Dayjs, fmt = 'YYYY-MM-DD HH:mm') {
  return dayjs(date).format(fmt);
}

export function formatPercent(progress?: ethers.BigNumberish) {
  return formatRate(toNumber(progress, 6));
}

export function formatRemain(a?: number, b?: number) {
  if (a && b) {
    return formatDate((a + b) * 1000, 'lll');
  }

  return '-';
}

export function formatSecDate(sec?: number | string) {
  if (sec) {
    return formatDate(+sec * 1000, 'lll');
  }

  return '-';
}
