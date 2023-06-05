import dayjs from 'dayjs';
import { omit } from 'lodash';
import { createRef } from 'react';
import { ethers, BigNumber } from 'ethers';
import MetaMaskOboarding from '@metamask/onboarding';

import * as U from '@/utils/utils';
import { RPC_URL } from '@/constants';
import abi from '@/abis/raise.abi.json';
import { toFixed } from '@/utils/format';

export const mountPortal = createRef<(node: React.ReactNode) => void>();
export const unmountPortal = createRef<() => void>();

export function createContract(address?: string) {
  if (!address || !MetaMaskOboarding.isMetaMaskInstalled()) return;

  const provider = new ethers.providers.Web3Provider(window.ethereum!);

  return new ethers.Contract(address, abi, provider.getSigner());
}

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

  return await res.json();
}

export async function fetchGas() {
  const res = await callRPC('eth_maxPriorityFeePerGas', []);

  if (res.result) {
    return res.result;
  }

  throw new Error(res.message);
}

export function withGas<R = any, P extends unknown[] = any>(service: (gas: string, ...args: P) => Promise<R>) {
  return async (...args: P) => {
    // const gas = await fetchGas();
    const gas = '0x30f3f';

    console.log('[maxPriorityFeePerGas]: ', gas);

    return await service(gas, ...args);
  };
}

export function withTx<P extends unknown[] = any>(service: (...args: P) => Promise<ethers.providers.TransactionResponse | undefined>) {
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

  return BigNumber.from(mid).mul(Math.pow(10, 10)).add(dayjs().unix());
}

/**
 * 计算各方权益配比
 * @param priority 优先部分（出币方权益）
 * @param spRate 技术运维服务费
 * @param ratio 保证金配比
 */
export function calcEachEarn(priority: number | string = 70, spRate: number | string = 5, ratio: number | string = 5) {
  const _priority = Number.isNaN(+priority) ? 0 : +priority;
  const _spRate = Number.isNaN(+spRate) ? 0 : +spRate;
  const _ratio = Number.isNaN(+ratio) ? 0 : +ratio;

  const investRate = +toFixed(U.accMul(_priority, U.accDiv(Math.max(U.accSub(100, _ratio), 0), 100)), 2); // 投资人分成
  const opsRate = +toFixed(U.accMul(_priority, U.accDiv(_ratio, 100)), 2); // 保证金分成
  const inferior = U.accSub(100, _priority); // 建设方分成(劣后部分)
  const ffiRate = +toFixed(U.accMul(inferior, 0.08), 2, 2); // FilFi协议费用（建设方 * 8%）
  const raiserRate = Math.max(U.accSub(inferior, _spRate, ffiRate), 0); // 发起人分成

  return {
    ratio,
    priority: _priority,
    investRate,
    opsRate,
    inferior,
    spRate: _spRate,
    raiserRate,
    ffiRate,
  };
}

/**
 * 计算募集保证金
 * @param target 募集目标
 * @param period 募集期限
 * @param seals 封装期限
 * @returns
 */
export function calcRaiseDepost(target: number, period: number, seals: number) {
  // 罚息倍数
  const pim = 3;
  // 年利率 = 1%
  const yRate = 0.01;
  // 协议罚金系数 = 0.1%
  const ratio = 0.001;
  // 展期天数
  const delay = U.accDiv(seals, 2);
  // 手续费 = 募集目标 * 0.3%
  const fee = U.accMul(target, 0.003);
  // 本金 = 募集目标 * (1 - 可以进入展期的最低比例)
  const cost = U.accMul(target, U.accSub(1, 0.5));

  // 募集期罚息 = (募集目标 + 运维保证金(最大=募集目标)) * 年利率 * 募集天数 / 365 + 手续费
  const rInterest = U.accAdd(U.accMul(U.accAdd(target, target), yRate, U.accDiv(period, 365)), fee);
  // 封装期罚息 = 募集目标 * 罚息倍数 * 年利率 * 封装天数 / 365 + 手续费
  const sInterest = U.accAdd(U.accMul(target, pim, yRate, U.accDiv(seals, 365)), fee);
  // 延长期罚息 = 本金 * 罚息倍数 * 年利率 * (封装天数 + 展期天数) / 365 + 本金 * 协议罚金系数 * 展期天数 + 手续费
  const dInterest = U.accAdd(U.accMul(cost, pim, yRate, U.accDiv(U.accAdd(seals, delay), 365)), U.accMul(cost, ratio, delay), fee);

  // 结果取最大值
  const result = Math.max(rInterest, sInterest, dInterest);

  // 保留3位小数，向上舍入
  return Number.isNaN(result) ? '0' : toFixed(result, 3, 2);
}

export function transformParams(data: API.Base) {
  const {
    sealDays,
    raiseDays,
    sectorSize,
    minRaiseRate,
    sectorPeriod,
    targetAmount,
    ffiProtocolFee,
    opsSecurityFund,
    raiseSecurityFund,
    opsSecurityFundRate,
    ...props
  } = data;
  const _params = omit(props, ['amount', 'amountType']);

  return {
    ..._params,
    sealDays: +sealDays,
    raiseDays: +raiseDays,
    minRaiseRate: +minRaiseRate,
    sectorPeriod: +sectorPeriod,
    sectorSize: U.gb2byte(sectorSize),
    opsSecurityFundRate: +opsSecurityFundRate,
    ffiProtocolFee: ethers.utils.parseEther(`${ffiProtocolFee}`).toString(),
    opsSecurityFund: ethers.utils.parseEther(`${opsSecurityFund}`).toString(),
    raiseSecurityFund: ethers.utils.parseEther(`${raiseSecurityFund}`).toString(),
    targetAmount: ethers.utils.parseEther(`${targetAmount}`).toString(),
  };
}

export function transformModel(data: API.Base) {
  const { sectorSize, targetAmount, raiseSecurityFund, opsSecurityFund, ffiProtocolFee, ...props } = data;

  const amount = +ethers.utils.formatEther(targetAmount);

  return {
    ...props,
    amount,
    targetAmount: amount,
    sectorSize: U.byte2gb(sectorSize),
    ffiProtocolFee: +ethers.utils.formatEther(ffiProtocolFee),
    opsSecurityFund: +ethers.utils.formatEther(opsSecurityFund),
    raiseSecurityFund: +ethers.utils.formatEther(raiseSecurityFund),
  };
}

/**
 * 将表单数据转换成 RaiseInfo
 * @param data 表单数据
 */
export function transformRaiseInfo(data: API.Plan): RaiseInfo {
  const { investRate, opsRate, spRate, raiserRate, ffiRate } = calcEachEarn(data.raiser_coin_share, data.op_server_share, data.ops_security_fund_rate);

  // 募集计划信息
  return {
    id: data.raising_id,
    targetAmount: data.target_amount,
    minRaiseRate: U.accMul(data.min_raise_rate, 100),
    securityFund: data.raise_security_fund,
    raiseDays: data.raise_days,
    filFiShare: U.accMul(ffiRate, 100),
    spFundShare: U.accMul(opsRate, 100),
    raiserShare: U.accMul(raiserRate, 100),
    investorShare: U.accMul(investRate, 100),
    servicerShare: U.accMul(spRate, 100),
    sponsor: data.raiser,
    raiseCompany: data.sponsor_company,
  };
}

/**
 * 将表单数据转换成 NodeInfo
 * @param data 表单数据
 */
export function transformNodeInfo(data: API.Plan): NodeInfo {
  // 节点信息
  return {
    minerId: +U.parseMinerID(data.miner_id),
    nodeSize: data.target_power,
    sectorSize: `${data.sector_size}`,
    sealDays: data.seal_days,
    nodeDays: data.sector_period,
    opsSecurityFund: data.ops_security_fund,
    spAddr: data.service_provider_address,
    companyId: data.service_id,
  };
}

/**
 * 将表单数据转换成 ExtraInfo
 * @param data 表单数据
 */
export function transformExtraInfo(data: API.Plan): ExtraInfo {
  // 拓展信息

  if (data.miner_type === 2) {
    const spPowerRate = Math.max(U.accSub(100, data.raise_his_power_rate), 0);
    const spPledgeRate = Math.max(U.accSub(100, data.raise_his_initial_pledge_rate), 0);

    return {
      oldId: +U.parseMinerID(data.miner_id),
      spOldShare: U.accMul(spPledgeRate, 100),
      raiserOldShare: U.accMul(data.raise_his_initial_pledge_rate, 100),
      spOldRewardShare: U.accMul(spPowerRate, 100),
      sponsorOldRewardShare: U.accMul(data.raise_his_power_rate, 100),
    };
  }

  return {
    oldId: 0,
    spOldShare: 0,
    raiserOldShare: 0,
    spOldRewardShare: 0,
    sponsorOldRewardShare: 0,
  };
}
