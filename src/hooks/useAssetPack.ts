import { useMemo } from 'react';

import { toNumber } from '@/utils/format';
import useRaiseBase from './useRaiseBase';
import useRaiseRate from './useRaiseRate';
import useRaiseRole from './useRaiseRole';
import useDepositInvestor from './useDepositInvestor';
import { accAdd, accDiv, accMul, accSub } from '@/utils/utils';

export default function useAssetPack(plan?: API.Plan | null, pack?: API.Pack | null) {
  const { actual } = useRaiseBase(plan);
  const { isRaiser, isServicer } = useRaiseRole(plan);
  const { ratio, record, isInvestor } = useDepositInvestor(plan);
  const { investRate, raiserRate, opsRate, servicerRate } = useRaiseRate(plan);

  const power = useMemo(() => +`${pack?.total_power || 0}`, [pack?.total_power]);
  const sector = useMemo(() => +`${pack?.total_sector || 0}`, [pack?.total_sector]);
  const pledge = useMemo(() => toNumber(pack?.total_pledge_amount), [pack?.total_pledge_amount]);
  // const opsAmount = useMemo(() => accDiv(accMul(actual, accDiv(opsRatio, 100)), accSub(1, accDiv(opsRatio, 100))), [actual, opsRatio]);

  // 建设者持有算力 = 总算力 * 投资占比 * 建设者权益
  const investorPower = useMemo(() => (isInvestor ? accMul(power, ratio, accDiv(investRate, 100)) : 0), [power, ratio, investRate, isInvestor]);
  // 主办人持有算力 = 总算力 * 主办人权益
  const raiserPower = useMemo(() => (isRaiser ? accMul(power, accDiv(raiserRate, 100)) : 0), [power, raiserRate, isRaiser]);
  // 运维保障金算力 = 总算力 * 运维保证金权益
  const opsPower = useMemo(() => (isServicer ? accMul(power, accDiv(opsRate, 100)) : 0), [power, opsRate, isServicer]);
  // 服务商算力 = 总算力 * 服务商权益
  const servicerPower = useMemo(() => (isServicer ? accMul(power, accDiv(servicerRate, 100)) : 0), [power, servicerRate, isServicer]);

  // 主办人持有质押
  const raiserPledge = useMemo(() => 0, []);
  // 建设者持有质押 = 总质押币 * 投资占比
  const investorPledge = useMemo(() => (isInvestor ? Math.min(accMul(pledge, ratio), record) : 0), [pledge, ratio, record, isInvestor]);
  // 服务商持有质押 = 总质押币 - 实际集合质押
  const servicerPledge = useMemo(() => (isServicer ? Math.max(accSub(pledge, actual), 0) : 0), [pledge, actual, isServicer]);
  // 运维保证金持有质押 = 运维保证金配比 * 封装进度
  const opsPledge = useMemo(() => 0, []);

  // 总持有算力
  const holdPower = useMemo(() => accAdd(investorPower, raiserPower, servicerPower), [investorPower, raiserPower, servicerPower]);
  const holdPledge = useMemo(() => accAdd(investorPledge, raiserPledge, servicerPledge), [investorPledge, raiserPledge, servicerPledge]);

  return {
    power,
    pledge,
    sector,
    opsPower,
    raiserPower,
    investorPower,
    servicerPower,
    opsPledge,
    raiserPledge,
    investorPledge,
    servicerPledge,
    holdPower,
    holdPledge,
  };
}
