import 'dayjs/locale/zh-cn';
import dayjs from 'dayjs';
import BigNumber from 'bignumber.js';
import { isAddress } from 'ethers/lib/utils';
import RelativeTime from 'dayjs/plugin/relativeTime';
import { ethAddressFromDelegated, newActorAddress, newDelegatedEthAddress, newIDAddress } from '@glif/filecoin-address';

dayjs.extend(RelativeTime);
dayjs.locale('zh-cn');

Object.defineProperty(window, '_dayjs', {
  value: dayjs,
  writable: false,
  enumerable: true,
});

export const isStr = (v: unknown): v is string => typeof v === 'string';

export const isDef = <T>(v: T | null | undefined): v is T => v !== null && v !== undefined;

export const isRef = <T>(val: unknown): val is React.MutableRefObject<T> =>
  Object.prototype.hasOwnProperty.call(val, 'current');

// eslint-disable-next-line @typescript-eslint/ban-types
export const isFn = (val: unknown): val is Function => typeof val === 'function';

export function isEqual(a?: unknown, b?: unknown) {
  const _a = `${a ?? ''}`;
  const _b = `${b ?? ''}`;

  if (_a && _b) {
    return _a.toLowerCase() === _b.toLowerCase();
  }

  return false;
}

/**
 * 精确加
 * @param args
 * @returns
 */
export function accAdd(...args: BigNumber.Value[]) {
  const [f, ...o] = args;

  return o.reduce<BigNumber>((p, c) => p.plus(c), BigNumber(f)).toNumber();
}

/**
 * 精确减
 * @param args
 * @returns
 */
export function accSub(...args: BigNumber.Value[]) {
  const [f, ...o] = args;

  return o.reduce<BigNumber>((p, c) => p.minus(c), BigNumber(f)).toNumber();
}

/**
 * 精确乘
 * @param a
 * @param b
 * @returns
 */
export function accMul(...args: BigNumber.Value[]) {
  const [f, ...o] = args;

  return o.reduce<BigNumber>((p, c) => p.times(c), BigNumber(f)).toNumber();
}

/**
 * 精确除
 * @param args
 * @returns
 */
export function accDiv(...args: BigNumber.Value[]) {
  const [f, ...o] = args;

  return o.reduce<BigNumber>((p, c) => p.div(c), BigNumber(f)).toNumber();
}

export async function sleep(delay = 200) {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise<void>((resolve) => setTimeout(resolve, delay));
}

export function disabledDate(date: number | string | Date | dayjs.Dayjs) {
  return dayjs(date).isBefore(dayjs(), 'date');
}

export function day2sec(days: number | string) {
  return +days * 86400;
}

export function sec2day(days?: number | string) {
  if (days) {
    return +(+days / 86400).toFixed(1).replace(/\.0$/, '');
  }

  return 0;
}

export function gb2byte(gb: number | string) {
  return +gb * 1024 * 1024 * 1024;
}

export function byte2gb(gb?: number | string) {
  if (gb) {
    return +gb / 1024 / 1024 / 1024;
  }

  return 0;
}

export function pb2byte(pb: number | string) {
  return +pb * 1024 * 1024 * 1024 * 1024 * 1024;
}

export function byte2pb(pb?: number | string) {
  if (pb) {
    return +pb / 1024 / 1024 / 1024 / 1024 / 1024;
  }

  return 0;
}

export function diffDays(seconds?: number | string) {
  if (seconds) {
    return dayjs(+seconds * 1000).fromNow();
  }

  return '';
}

export function parseMinerID(minerID: number | string) {
  return `${minerID}`.trim().replace(/^(f0|t0)/i, '');
}

export function toF2Address(minerId?: string) {
  if (minerId) {
    return newActorAddress(newIDAddress(parseMinerID(minerId)).bytes).toString();
  }

  return '';
}

export function toEthAddr(addr?: string) {
  if (addr) {
    if (isAddress(addr)) return addr;

    return ethAddressFromDelegated(addr);
  }

  return '';
}

export function toF4Address(addr?: string) {
  if (addr && isAddress(addr)) {
    return newDelegatedEthAddress(addr).toString();
  }

  return '';
}

export function genKey() {
  return (~~(Math.random() * 10000000)).toString(16);
}
