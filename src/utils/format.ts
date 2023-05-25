import dayjs from 'dayjs';
import numeral from 'numeral';
import { ethers } from 'ethers';
import { BigNumber } from 'bignumber.js';
import { accAdd, sec2day } from './utils';

export function formatFix(val?: number | string) {
  return `${val ?? ''}`.replace(/(?:\.0*|(\.\d+?)0+)$/, '$1');
}

export function formatNum(num: number | string, fmt: string, runding?: numeral.RoundingFunction) {
  return formatFix(numeral(num).format(fmt, runding));
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
  return BigNumber(ethers.utils.formatUnits(`${amount || 0}`, unitName)).toNumber();
}

export function formatAmount(amount?: BigNumber.Value, decimalPlaces = 4) {
  return formatFix(BigNumber(amount ?? 0).toFormat(decimalPlaces, BigNumber.ROUND_HALF_EVEN));
}

export function formatEther(amount?: ethers.BigNumberish, decimalPlaces?: number) {
  return formatAmount(toNumber(amount), decimalPlaces);
}

export function formatDate(date: number | string | Date | dayjs.Dayjs, fmt = 'YYYY-MM-DD HH:mm') {
  return dayjs(date).format(fmt);
}

export function formatUnixNow(date: number | string | Date | dayjs.Dayjs) {
  return dayjs(date).fromNow();
}

export function formatPercent(progress?: ethers.BigNumberish, fmt = '0%') {
  return formatRate(toNumber(progress, 6), fmt);
}

export function formatPower(power?: number | string, fmt = '0.0 ib') {
  if (typeof power !== 'undefined') {
    return formatNum(power, fmt).split(' ');
  }
}

export function formatRemain(...args: (number | string)[]) {
  if (args.every(Boolean)) {
    const sum = args.reduce<number>((sum, cur) => accAdd(sum, cur), 0);

    return formatUnix(sum, 'lll');
  }

  return '-';
}

export function formatUnixDate(sec?: number | string, fmt = 'lll') {
  if (sec) {
    return formatUnix(+sec, fmt);
  }

  return '-';
}

export function formatSecDays(sec?: number | string) {
  const days = sec2day(sec);

  return formatNum(days, '0.0');
}
