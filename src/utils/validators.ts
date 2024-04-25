import { ethers } from 'ethers';
import { validateAddressString } from '@glif/filecoin-address';

import { isFn } from './utils';
import { isAddress } from 'ethers/lib/utils';

export type Validator<R = unknown> = (rule: R, value: string) => Promise<any>;

export class Queue {
  #validators: Validator<any>[] = [];

  static create() {
    return new Queue();
  }

  add<R = unknown>(validator: Validator<R>) {
    this.#validators.push(validator);

    return this;
  }

  build() {
    return async (rule: unknown, value: string) => {
      if (`${value ?? ''}`) {
        for (let validator of this.#validators) {
          await validator(rule, value);
        }
      }
    };
  }
}

export function createValidator(pattern: RegExp | ((value: string) => boolean), message: string) {
  return async function validator(rule: unknown, value: string) {
    if (`${value ?? ''}`) {
      const valid = isFn(pattern) ? pattern(value) : pattern.test(value);
      if (!valid) {
        return Promise.reject(message);
      }
    }
  };
}

export const address = createValidator(ethers.utils.isAddress, '無效的地址');

export const number = createValidator(/^\d+(\.\d+)?$/, '請輸入數字');

export const integer = createValidator(/^[1-9]([0-9]+)?$/, '請輸入正整數');

export const minerID = createValidator(/^(f0|t0)[0-9]{5,}$/i, '無效的節點號');

export const f4Address = createValidator((address) => {
  return /^(t4|f4)/i.test(address) && validateAddressString(address);
}, '無效的地址');

export const combineAddr = createValidator((addr) => {
  return isAddress(addr) || (/^(t4|f4)/i.test(addr) && validateAddressString(addr));
}, '無效的地址');

export function createGtValidator(min: number, message?: string) {
  return async function validator(rule: unknown, value: string) {
    const val = +`${value ?? ''}`;

    if (!Number.isNaN(val) && val <= min) {
      return Promise.reject(message ?? `必須大於${min}`);
    }
  };
}

export function createGteValidator(min: number, message?: string) {
  return async function validator(rule: unknown, value: string) {
    const val = +`${value ?? ''}`;

    if (!Number.isNaN(val) && val < min) {
      return Promise.reject(message ?? `不能小於${min}`);
    }
  };
}

export function createLtValidator(max: number, message?: string) {
  return async function validator(rule: unknown, value: string) {
    const val = +`${value ?? ''}`;

    if (!Number.isNaN(val) && val >= max) {
      return Promise.reject(message ?? `必須小於${max}`);
    }
  };
}

export function createLteValidator(max: number, message?: string) {
  return async function validator(rule: unknown, value: string) {
    const val = +`${value ?? ''}`;

    if (!Number.isNaN(val) && val > max) {
      return Promise.reject(message ?? `不能大於${max}`);
    }
  };
}

export function createDecimalValidator(decimal: number | RegExp, message: string) {
  return async function validator(rule: unknown, value: string) {
    let reg: RegExp;

    if (typeof decimal === 'number') {
      reg = new RegExp(`^[0-9]+(.[0-9]{1,${decimal}})?$`);
    } else {
      reg = decimal;
    }

    if (!reg.test(value)) {
      return Promise.reject(message);
    }
  };
}

export function createIntRangeValidator(range: [number, number], message: string) {
  return async function validator(rule: unknown, value: string) {
    await integer(rule, value);

    if (`${value ?? ''}` && (+value < range[0] || +value > range[1])) {
      return Promise.reject(message);
    }
  };
}

export function createNumRangeValidator(range: [number, number], message: string) {
  return async function validator(rule: unknown, value: string) {
    await number(rule, value);

    if (`${value ?? ''}` && (+value < range[0] || +value > range[1])) {
      return Promise.reject(message);
    }
  };
}

export const percent = createIntRangeValidator([0, 100], '請輸入0-100之間的數');

export const minRaiseRate = createNumRangeValidator([10, 100], '最小10%，最大100%');
