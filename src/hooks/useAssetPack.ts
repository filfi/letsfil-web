import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import useContract from './useContract';
import useRaiseBase from './useRaiseBase';
import useRaiseRate from './useRaiseRate';
import useRaiseRole from './useRaiseRole';
import { withNull } from '@/utils/hackify';
import { isServicerPaied } from '@/helpers/raise';
import { toFixed, toNumber } from '@/utils/format';
import useDepositInvestor from './useDepositInvestor';
import { accAdd, accDiv, accMul, accSub } from '@/utils/utils';

export default function useAssetPack(plan?: API.Plan | null, pack?: API.Pack | null) {
  const contract = useContract(plan?.raise_address);

  const getOpsFundSealed = async () => {
    if (plan && isServicerPaied(plan)) {
      return await contract.getOpsFundSealed(plan.raising_id);
    }
  };

  const { isRaiser, isServicer } = useRaiseRole(plan);
  const { record, isInvestor } = useDepositInvestor(plan);
  const { actual, progress: _progress, target } = useRaiseBase(plan);
  const { priorityRate, raiserRate, superRate, opsRatio: ratio, servicerRate } = useRaiseRate(plan);
  // 已封装的缓冲金
  const { data: opsSealed, isLoading } = useQuery(['getOpsFundSealed', plan?.raising_id], withNull(getOpsFundSealed));

  // 总算力
  const power = useMemo(() => +`${pack?.total_power || 0}`, [pack?.total_power]);
  // 封装扇区
  const sector = useMemo(() => +`${pack?.total_sector || 0}`, [pack?.total_sector]);
  // 已封装质押
  const pledge = useMemo(() => toNumber(pack?.total_pledge_amount), [pack?.total_pledge_amount]);

  // 已缴纳运维保证金 = (募集目标 * 保证金分配比例) / (1 - 保证金分配比例)
  const opsActual = useMemo(() => +toFixed(accDiv(accMul(target, accDiv(ratio, 100)), accSub(1, accDiv(ratio, 100))), 2, 2), [target, ratio]);
  // 实际配比运维保证金 = 已缴纳运维保证金 * 募集比例
  const opsCurrent = useMemo(() => accMul(opsActual, _progress), [opsActual, _progress]);
  // 总运维保证金 = 实际配比运维保证金 + 已封装缓冲金
  const opsAmount = useMemo(() => accAdd(opsCurrent, opsSealed ?? 0), [opsCurrent, opsSealed]);
  // 总质押 = 实际募集 + 总运维保证金
  const total = useMemo(() => accAdd(actual, opsAmount), [actual, opsAmount]);
  // 运维保证金占比 = 总运维保证金 / 总质押
  const opsRatio = useMemo(() => (total > 0 ? accDiv(opsAmount, total) : 0), [opsAmount, total]);
  // 建设者投资占比 = 投入金额 / 总质押
  const investorRatio = useMemo(() => (total > 0 ? Math.min(accDiv(record, total), 1) : 0), [record, total]);
  // 封装进度 = 已封装质押 / (实际募集 + 实际配比运维保证金)
  const progress = useMemo(() => (actual > 0 ? accDiv(pledge, accAdd(actual, opsCurrent)) : 0), [pledge, actual, opsCurrent]);

  // 建设者封装算力 = 总算力 * 建设者投资占比
  const investorSealsPower = useMemo(() => (isInvestor ? accMul(power, investorRatio) : 0), [power, investorRatio, isInvestor]);
  // 建设者权益算力 = 建设者封装算力 * 建设者权益
  const investorPower = useMemo(() => (isInvestor ? accMul(investorSealsPower, accDiv(priorityRate, 100)) : 0), [investorSealsPower, priorityRate, isInvestor]);

  // 主办人持有算力 = 总算力 * 主办人权益
  const raiserPower = useMemo(() => (isRaiser ? accMul(power, accDiv(raiserRate || superRate, 100)) : 0), [power, raiserRate, superRate, isRaiser]);

  // 运维保证金封装算力 = 总算力 * 运维保证金占比
  const opsSealsPower = useMemo(() => (isServicer ? accMul(power, opsRatio) : 0), [power, opsRatio, isServicer]);
  // 运维保证金权益算力 = 运维保证金封装算力 * 运维保证金权益
  const opsPower = useMemo(() => (isServicer ? accMul(opsSealsPower, accDiv(priorityRate, 100)) : 0), [opsSealsPower, priorityRate, isServicer]);
  // 服务商权益算力 = 总算力 * 服务商权益
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
    isLoading,
  };
}
