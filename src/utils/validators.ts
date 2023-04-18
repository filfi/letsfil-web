import { ethers } from 'ethers';

export async function address(rule: unknown, value: string) {
  if (value) {
    if (!ethers.utils.isAddress(value)) {
      return Promise.reject('无效的地址');
    }
  }
}

export async function number(rule: unknown, value: string) {
  if (value) {
    if (!/^\d+(\.\d+)?$/.test(value)) {
      return Promise.reject('请输入数字');
    }
  }
}

export async function minerID(rule: unknown, value: string) {
  if (value) {
    if (!/^(f0|t0)[0-9]+$/i.test(value)) {
      return Promise.reject('无效的MinerID');
    }
  }
}

export async function minRaiseRate(rule: unknown, value: string) {
  await number(rule, value);

  if (value && (+value < 10 || +value > 100)) {
    return Promise.reject('最小10%，最大100%');
  }
}
