import 'dayjs/locale/zh-cn';
import dayjs from 'dayjs';
import BigNumber from 'bignumber.js';

dayjs.locale('zh-cn');

export function isFn(val: unknown): val is () => void {
  return typeof val === 'function';
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
  return dayjs(date).isBefore(dayjs().add(1, 'D'));
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
  return dayjs(+seconds * 1000).diff(dayjs(), 'days');
}

export function parseMinerID(minerID: string) {
  return `${minerID}`.replace(/^(f0|t0)/i, '');
}

export async function withTx(tx: Promise<any> | (() => Promise<any>)) {
  const promise = isFn(tx) ? tx() : tx;

  const _tx = await promise;

  // 交易上链
  const res = await _tx?.wait();

  console.log(res);

  if (res?.status !== 1) {
    throw new Error('交易失败');
  }

  return res;
}
