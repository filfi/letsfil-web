import { ethers } from 'ethers';
import { createRef } from 'react';
import { RPC_URL } from '@/constants';

export const mountPortal = createRef<(node: React.ReactNode) => void>();
export const unmountPortal = createRef<() => void>();

export async function callRPC(method: string, params: (number | string)[]) {
  const url = `${RPC_URL}/v1`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      method,
      params,
      id: 1,
      jsonrpc: '2.0',
    }),
  });

  const data = await res.json();

  return data.result;
}

export async function fetchGas() {
  const gas = await callRPC('eth_maxPriorityFeePerGas', []);

  return gas;
}

export function withGas<R = any, P extends unknown[] = any>(service: (gas: ethers.BigNumberish, ...args: P) => Promise<R>) {
  return async (...args: P) => {
    const gas = await fetchGas();

    console.log('[maxPriorityFeePerGas]: ', gas);

    return await service(gas, ...args);
  };
}

export function withTx<P extends unknown[] = any>(service: (...args: P) => Promise<any>) {
  return async (...args: P) => {
    const tx = await service(...args);

    console.log('[transaction]: ', tx);

    // 交易上链
    const res = await tx?.wait();

    console.log(res);

    if (res && res.status !== 1) {
      throw new Error('交易失败');
    }

    return res;
  };
}
