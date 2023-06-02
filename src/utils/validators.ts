import { ethers } from 'ethers';
import { isFn } from './utils';

export function createValidator(pattern: RegExp | ((value: string) => boolean), message: string) {
  return async function validator(rule: unknown, value: string) {
    if (`${value}`) {
      const valid = isFn(pattern) ? pattern(value) : pattern.test(value);
      if (!valid) {
        return Promise.reject(message);
      }
    }
  };
}

export const address = createValidator(ethers.utils.isAddress, '无效的地址');

export const number = createValidator(/^\d+(\.\d+)?$/, '请输入数字');

export const integer = createValidator(/^[1-9]([0-9]+)?$/, '请输入正整数');

export const minerID = createValidator(/^(f0|t0)[0-9]+$/i, '无效的MinerID');

export function createIntRangeValidator(range: [number, number], message: string) {
  return async function validator(rule: unknown, value: string) {
    await integer(rule, value);

    if (`${value}` && (+value < range[0] || +value > range[1])) {
      return Promise.reject(message);
    }
  };
}

export function createNumRangeValidator(range: [number, number], message: string) {
  return async function validator(rule: unknown, value: string) {
    await number(rule, value);

    if (`${value}` && (+value < range[0] || +value > range[1])) {
      return Promise.reject(message);
    }
  };
}

export const percent = createIntRangeValidator([0, 100], '请输入0-100之间的数');

export const minRaiseRate = createNumRangeValidator([10, 100], '最小10%，最大100%');
