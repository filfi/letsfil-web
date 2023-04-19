import 'dayjs/locale/zh-cn';
import dayjs from 'dayjs';
import BigNumber from 'bignumber.js';
import RelativeTime from 'dayjs/plugin/relativeTime';
import { newDelegatedEthAddress } from '@glif/filecoin-address';

dayjs.extend(RelativeTime);
dayjs.locale('zh-cn');

Object.defineProperty(window, '_dayjs', {
  value: dayjs,
  writable: false,
  enumerable: true,
});

export const isStr = (v: unknown): v is string => typeof v === 'string';

export const isDef = <T>(v: T | null | undefined): v is T => v !== null && v !== undefined;

export const isRef = <T>(val: unknown): val is React.MutableRefObject<T> => Object.prototype.hasOwnProperty.call(val, 'current');

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
 * @param a
 * @param b
 * @returns
 */
export function accAdd(a: BigNumber.Value, b: BigNumber.Value) {
  return BigNumber(a).plus(b).toNumber();
}

/**
 * 精确减
 * @param a
 * @param b
 * @returns
 */
export function accSub(a: BigNumber.Value, b: BigNumber.Value) {
  return BigNumber(a).minus(b).toNumber();
}

/**
 * 精确乘
 * @param a
 * @param b
 * @returns
 */
export function accMul(a: BigNumber.Value, b: BigNumber.Value) {
  return BigNumber(a).times(b).toNumber();
}

/**
 * 精确除
 * @param a
 * @param b
 * @returns
 */
export function accDiv(a: BigNumber.Value, b: BigNumber.Value) {
  return BigNumber(a).div(b).toNumber();
}

export async function sleep(delay = 200) {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise<void>((resolve) => setTimeout(resolve, delay));
}

export function disabledDate(date: number | string | Date | dayjs.Dayjs) {
  // TODO: Date Limit
  return dayjs(date).isBefore(dayjs(), 'date');
}

export function day2sec(days: number | string) {
  return +days * 24 * 60 * 60;
}

export function sec2day(days?: number | string) {
  if (days) {
    return +days / 60 / 60 / 24;
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

export function diffDays(seconds: number | string) {
  return dayjs(+seconds * 1000).fromNow();
}

export function parseMinerID(minerID: number | string) {
  return `${minerID}`.trim().replace(/^(f0|t0)/i, '');
}

export function toF4Address(addr?: string) {
  if (addr) {
    return newDelegatedEthAddress(addr).toString();
  }

  return '';
}
