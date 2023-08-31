import { ethers } from 'ethers';
import { isFn } from './utils';

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

export const address = createValidator(ethers.utils.isAddress, '无效的地址');

export const number = createValidator(/^\d+(\.\d+)?$/, '请输入数字');

export const integer = createValidator(/^[1-9]([0-9]+)?$/, '请输入正整数');

export const minerID = createValidator(/^(f0|t0)[0-9]+$/i, '无效的节点号');

export function createGtValidator(min: number, message?: string) {
  return async function validator(rule: unknown, value: string) {
    const val = +`${value ?? ''}`;

    if (!Number.isNaN(val) && val <= min) {
      return Promise.reject(message ?? `必须大于${min}`);
    }
  };
}

export function createGteValidator(min: number, message?: string) {
  return async function validator(rule: unknown, value: string) {
    const val = +`${value ?? ''}`;

    if (!Number.isNaN(val) && val < min) {
      return Promise.reject(message ?? `不能小于${min}`);
    }
  };
}

export function createLtValidator(max: number, message?: string) {
  return async function validator(rule: unknown, value: string) {
    const val = +`${value ?? ''}`;

    if (!Number.isNaN(val) && val >= max) {
      return Promise.reject(message ?? `必须小于${max}`);
    }
  };
}

export function createLteValidator(max: number, message?: string) {
  return async function validator(rule: unknown, value: string) {
    const val = +`${value ?? ''}`;

    if (!Number.isNaN(val) && val > max) {
      return Promise.reject(message ?? `不能大于${max}`);
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

export const percent = createIntRangeValidator([0, 100], '请输入0-100之间的数');

export const minRaiseRate = createNumRangeValidator([10, 100], '最小10%，最大100%');
