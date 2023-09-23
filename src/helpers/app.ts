import dayjs from 'dayjs';
import { omit } from 'lodash';
import { createRef } from 'react';
import { ethers, BigNumber } from 'ethers';

import * as U from '@/utils/utils';
import { RPC_URL } from '@/constants';
import { toFixed, toNumber } from '@/utils/format';
import { isAddress } from 'ethers/lib/utils';

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
 * @param precision 精度
 */
export function calcEachEarn(priority: number | string = 70, spRate: number | string = 5, ratio: number | string = 5, precision: number = 2) {
  const _priority = Number.isNaN(+priority) ? 0 : +priority;
  const _spRate = Number.isNaN(+spRate) ? 0 : +spRate;
  const _ratio = Number.isNaN(+ratio) ? 0 : +ratio;

  const inferior = U.accSub(100, _priority); // 建设方分成(劣后部分)
  const ffiRate = +toFixed(U.accMul(inferior, 0.08), precision, 2); // FilFi协议费用（建设方 * 8%）
  const investRate = +toFixed(U.accMul(_priority, U.accDiv(Math.max(U.accSub(100, _ratio), 0), 100)), precision); // 建设者分成
  const opsRate = +toFixed(U.accMul(_priority, U.accDiv(_ratio, 100)), precision); // 保证金分成
  const raiserRate = Math.max(U.accSub(inferior, _spRate, ffiRate), 0); // 主办人分成

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
 * 计算主办人保证金
 * @param target 质押目标
 * @returns
 */
export function calcRaiseDepost(target: number) {
  const rate = 0.05;
  const feeRate = 0.003;

  const fund = U.accMul(target, rate);
  const fee = U.accMul(target, feeRate);
  const amount = U.accAdd(fund, fee);

  // 保留3位小数，向上舍入
  return Number.isNaN(amount) ? '0' : toFixed(amount, 3, 2);
}

export function transformParams(data: API.Base) {
  const {
    sealDays = 0,
    raiseDays = 0,
    sectorSize = 0,
    minRaiseRate = 0,
    sectorPeriod = 0,
    targetAmount = 0,
    ffiProtocolFee = 0,
    opsSecurityFund = 0,
    raiseSecurityFund = 0,
    opsSecurityFundRate = 0,
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

  // 节点计划信息
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

export function parseSponsors(list: API.Equity[]) {
  return list
    .filter((item) => item.role === 1)
    .map((i) => ({
      address: i.fil_address || i.address,
      rate: toNumber(i.power_proportion, 5).toString(),
    }));
}

export function parseInvestors(list: API.Equity[]) {
  return list
    .filter((item) => item.role === 2)
    .map((i) => ({
      address: i.fil_address || i.address,
      amount: toNumber(i.pledge_amount).toString(),
      rate: toNumber(i.power_proportion, 5).toString(),
    }));
}

export function parseWhitelist(val: string) {
  try {
    const items = JSON.parse(val);

    if (Array.isArray(items)) {
      return items.map((i: API.Base) => ({
        address: U.toEthAddr(i.address || i.fil_address),
        filAddress: i.fil_address,
        limit: toNumber(i.can_pledge_amount).toString(),
      }));
    }
  } catch (e) {}

  return [];
}

export function transformSponsor({ address, level = 2, rate = 0 }: API.Base) {
  return {
    role: 1,
    role_level: level,
    address: isAddress(address) ? address : '',
    fil_address: isAddress(address) ? '' : address,
    power_proportion: ethers.utils.parseUnits(`${rate}`, 5).toString(),
  };
}

export function transformInvestor({ address, amount = 0, rate = 0 }: API.Base) {
  return {
    role: 2,
    address: isAddress(address) ? address : '',
    fil_address: isAddress(address) ? '' : address,
    pledge_amount: ethers.utils.parseEther(`${amount}`).toString(),
    power_proportion: ethers.utils.parseUnits(`${rate}`, 5).toString(),
  };
}

export function transformWhitelist({ address, limit = '0' }: API.Base) {
  return {
    address: isAddress(address) ? address : '',
    fil_address: isAddress(address) ? '' : address,
    can_pledge_amount: ethers.utils.parseEther(`${limit}`).toString(),
  };
}
