import dayjs from 'dayjs';
import { ethers } from 'ethers';
import { createRef } from 'react';

import * as U from '@/utils/utils';
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

export function withGas<R = any, P extends unknown[] = any>(service: (gas: string, ...args: P) => Promise<R>) {
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

export function genRaiseID(minerId: number | string) {
  const mid = U.parseMinerID(minerId);

  return ethers.BigNumber.from(mid).mul(Math.pow(10, 10)).add(dayjs().unix());
}

/**
 * 将表单数据转换成 RaiseInfo
 * @param data 表单数据
 */
export function transformRaiseInfo(data: API.Base) {
  // 募集计划信息
  return {
    id: genRaiseID(data.minerID),
    targetAmount: ethers.utils.parseEther(`${data.targetAmount}`),
    securityFund: ethers.utils.parseEther(`${data.securityFund}`),
    securityFundRate: data.securityFundRate * 100,
    deadline: dayjs(data.deadline).unix(),
    raiserShare: +data.raiserShare,
    investorShare: +data.investorShare,
    servicerShare: +data.servicerShare,
    sponsor: data.sponsor,
    raiseCompany: data.raiseCompany,
    spAddress: data.spAddress,
    companyId: data.companyId,
  };
}

/**
 * 将表单数据转换成 NodeInfo
 * @param data 表单数据
 */
export function transformNodeInfo(data: API.Base) {
  // 节点信息
  return {
    minerID: +U.parseMinerID(data.minerID),
    nodeSize: `${U.pb2byte(data.nodeSize)}`,
    sectorSize: +data.sectorSize,
    sealPeriod: U.day2sec(data.sealPeriod),
    nodePeriod: U.day2sec(data.nodePeriod),
    opsSecurityFund: ethers.utils.parseEther(`${data.securityFund}`),
    opsSecurityFundPayer: data.sponsor,
    realSealAmount: 0,
  };
}
