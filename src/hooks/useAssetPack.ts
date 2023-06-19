import { useMemo } from 'react';

import useRaiseBase from './useRaiseBase';
import useRaiseRate from './useRaiseRate';
import useRaiseRole from './useRaiseRole';
import { toFixed, toNumber } from '@/utils/format';
import useDepositInvestor from './useDepositInvestor';
import { accAdd, accDiv, accMul, accSub } from '@/utils/utils';

export default function useAssetPack(plan?: API.Plan | null, pack?: API.Pack | null) {
  const { actual } = useRaiseBase(plan);
  const { isRaiser, isServicer } = useRaiseRole(plan);
  const { record, isInvestor } = useDepositInvestor(plan);
  const { priorityRate, raiserRate, opsRatio: ratio, servicerRate } = useRaiseRate(plan);

  // 总算力
  const power = useMemo(() => +`${pack?.total_power || 0}`, [pack?.total_power]);
  // 封装扇区
  const sector = useMemo(() => +`${pack?.total_sector || 0}`, [pack?.total_sector]);
  // 总封装质押
  const pledge = useMemo(() => toNumber(pack?.total_pledge_amount), [pack?.total_pledge_amount]);
  // 运维保证金
  const opsAmount = useMemo(() => +toFixed(accDiv(accMul(actual, accDiv(ratio, 100)), accSub(1, accDiv(ratio, 100))), 2, 2), [actual, ratio]);
  // 总质押
  const total = useMemo(() => accAdd(actual, opsAmount), [actual, opsAmount]);
  // 运维保证金占比
  const opsRatio = useMemo(() => (total > 0 ? accDiv(opsAmount, total) : 0), [opsAmount, total]);
  // 建设者投资占比
  const investorRatio = useMemo(() => (total > 0 ? Math.min(accDiv(record, total), 1) : 0), [record, total]);
  // 封装进度
  const progress = useMemo(() => (actual > 0 ? Math.min(accDiv(pledge, actual), 1) : 0), [actual, pledge]);

  // 建设者封装算力 = 总算力 * 投资占比
  const investorSealsPower = useMemo(() => (isInvestor ? accMul(power, investorRatio) : 0), [power, investorRatio, isInvestor]);
  // 建设者持有算力 = 建设者封装算力 * 建设者权益
  const investorPower = useMemo(() => (isInvestor ? accMul(investorSealsPower, accDiv(priorityRate, 100)) : 0), [investorSealsPower, priorityRate, isInvestor]);
  // 主办人持有算力 = 总算力 * 主办人权益
  const raiserPower = useMemo(() => (isRaiser ? accMul(power, accDiv(raiserRate, 100)) : 0), [power, raiserRate, isRaiser]);
  // 运维保证金封装算力 = 总算力 * 运维保证金占比
  const opsSealsPower = useMemo(() => (isServicer ? accMul(power, opsRatio) : 0), [power, opsRatio, isServicer]);
  // 运维保障金算力 = 运维保证金封装算力 * 运维保证金权益
  const opsPower = useMemo(() => (isServicer ? accMul(opsSealsPower, accDiv(priorityRate, 100)) : 0), [opsSealsPower, priorityRate, isServicer]);
  // 服务商算力 = 总算力 * 服务商权益
  const servicerPower = useMemo(() => (isServicer ? accMul(power, accDiv(servicerRate, 100)) : 0), [power, servicerRate, isServicer]);

  // 主办人持有质押
  const raiserPledge = useMemo(() => 0, []);
  // 服务商持有质押
  const servicerPledge = useMemo(() => 0, []);
  // 运维保证金持有质押
  const opsPledge = useMemo(() => (isServicer ? Math.max(accSub(pledge, actual), 0) : 0), [actual, pledge, isServicer]);
  // 建设者持有质押
  const investorPledge = useMemo(() => (isInvestor ? Math.min(accMul(pledge, accDiv(record, actual)), record) : 0), [actual, pledge, record, isInvestor]);

  // 总持有算力
  const holdPower = useMemo(() => accAdd(investorPower, raiserPower, servicerPower, opsPower), [investorPower, raiserPower, servicerPower, opsPower]);
  const holdPledge = useMemo(() => accAdd(investorPledge, raiserPledge, servicerPledge, opsPledge), [investorPledge, raiserPledge, servicerPledge, opsPledge]);

  return {
    power,
    pledge,
    sector,
    progress,
    opsPower,
    opsRatio,
    opsAmount,
    opsSealsPower,
    raiserPower,
    investorPower,
    investorRatio,
    investorSealsPower,
    investorAmount: record,
    servicerPower,
    opsPledge,
    raiserPledge,
    investorPledge,
    servicerPledge,
    holdPower,
    holdPledge,
  };
}
