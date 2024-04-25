import dayjs from 'dayjs';
import numeral from 'numeral';
import { ethers } from 'ethers';
import { BigNumber } from 'bignumber.js';
import { accAdd, sec2day } from './utils';
import { isAddress } from 'ethers/lib/utils';

export function toFixed(amount?: BigNumber.Value, decimalPlaces = 3, mode: BigNumber.RoundingMode = 3) {
  return BigNumber(amount ?? 0).toFixed(decimalPlaces, mode);
}

export function toNumber(amount?: ethers.BigNumberish, unitName: ethers.BigNumberish = 18) {
  return BigNumber(ethers.utils.formatUnits(`${amount || 0}`, unitName)).toNumber();
}

export function formatID(id?: number | string) {
  if (id) {
    return (+id).toString(36).toUpperCase();
  }
}

export function formatFix(val?: number | string) {
  return `${val ?? ''}`.replace(/(?:\.0*|(\.\d+?)0+)$/, '$1');
}

export function formatNum(num: number | string, fmt: string, runding?: numeral.RoundingFunction) {
  return formatFix(numeral(num).format(fmt, runding));
}

export function formatByte(byte: number | string, fmt = '0ib') {
  return formatNum(byte, fmt).replace(/iB$/, 'B');
}

export function formatBytes(bytes: number | string, decimals = 2, mode: BigNumber.RoundingMode = 3) {
  const val = +bytes;

  if (!val) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

  const i = Math.floor(Math.log(val) / Math.log(k));

  return `${formatFix(toFixed(val / Math.pow(k, i), dm, mode))} ${sizes[i]}`;
}

export function formatRate(rate: number | string, fmt = '0%') {
  return formatNum(rate, fmt);
}

export function formatProgress(value: number | string, fmt = '0%') {
  const v = (+value * 100 - 0.5) / 100;

  return formatRate(Number.isNaN(v) ? 0 : v, fmt);
}

export function formatUnix(date: number, fmt = 'YYYY-MM-DD HH:mm') {
  return dayjs(date * 1000).format(fmt);
}

export function formatAddr(addr?: unknown) {
  if (typeof addr === 'string') {
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  }

  return '';
}

export function formatAmount(amount?: BigNumber.Value, decimalPlaces = 4, mode: BigNumber.RoundingMode = 3) {
  return formatFix(BigNumber(amount ?? 0).toFormat(decimalPlaces, mode));
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

export function formatPower(power?: number | string, decimals = 2, mode: BigNumber.RoundingMode = 3) {
  if (typeof power !== 'undefined') {
    return formatBytes(power, decimals, mode).split(' ') as [string, string];
  }
}

export function formatSeals(days: number) {
  return Math.round(days + 0.5);
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

export function formatSponsor(sponsor?: string) {
  if (sponsor && isAddress(sponsor)) {
    return formatAddr(sponsor);
  }

  return sponsor;
}

export function formatSecDays(sec?: number | string) {
  const days = sec2day(sec);

  return formatNum(days, '0.0');
}
