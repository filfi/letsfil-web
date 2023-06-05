import { useMemo } from 'react';

import { toNumber } from '@/utils/format';
import useRaiseInfo from './useRaiseInfo';
import useRaiseRate from './useRaiseRate';
import useDepositInvestor from './useDepositInvestor';
import { accAdd, accDiv, accMul, accSub } from '@/utils/utils';

export default function useAssetPack(plan?: API.Plan, pack?: { pledge: string; power: string }) {
  const { amount, ratio, record } = useDepositInvestor(plan);
  const { actual, isRaiser, isServicer } = useRaiseInfo(plan);
  const { investRate, raiserRate, opsRate, servicerRate } = useRaiseRate(plan);

  const power = useMemo(() => +`${pack?.power || 0}`, [pack?.power]);
  const pledge = useMemo(() => toNumber(pack?.pledge), [pack?.pledge]);
  // 建设者持有算力
  const investPower = useMemo(() => accMul(power, accDiv(investRate, 100), ratio), [power, ratio, investRate]);
  // 主办人持有算力
  const raiserPower = useMemo(() => (isRaiser ? accMul(power, accDiv(raiserRate, 100)) : 0), [power, raiserRate, isRaiser]);
  // 服务商持有算力
  const servicerPower = useMemo(
    () => (isServicer ? accAdd(accMul(power, accDiv(servicerRate, 100)), accMul(power, accDiv(opsRate, 100))) : 0),
    [power, servicerRate, opsRate, isServicer],
  );

  // 建设者持有质押币
  const investPledge = useMemo(() => (pledge < actual ? accMul(pledge, ratio) : record), [pledge, ratio, record, actual]);
  // 服务商持有质押币
  const servicerPledge = useMemo(() => (isServicer ? Math.max(accSub(pledge, actual), 0) : 0), [pledge, actual, isServicer]);

  // 总持有算力
  const holdPower = useMemo(() => accAdd(investPower, raiserPower, servicerPower), [investPower, raiserPower, servicerPower]);
  const holdPledge = useMemo(() => accAdd(investPledge, servicerPledge), [investPledge, servicerPledge]);

  return {
    amount,
    ratio,
    power,
    pledge,
    isRaiser,
    isServicer,
    investRate,
    raiserRate,
    servicerRate,
    investPower,
    raiserPower,
    servicerPower,
    investPledge,
    servicerPledge,
    holdPower,
    holdPledge,
  };
}
