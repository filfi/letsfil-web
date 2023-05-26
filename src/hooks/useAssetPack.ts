import { useMemo } from 'react';

import { toNumber } from '@/utils/format';
import useRaiseRate from './useRaiseRate';
import useRaiseState from './useRaiseState';
import useDepositInvest from './useDepositInvest';
import { accAdd, accDiv, accMul } from '@/utils/utils';

export default function useAssetPack(plan?: API.Plan, pack?: { pledge: string; power: string }) {
  const { amount, ratio } = useDepositInvest(plan);
  const { contract, isRaiser, isServicer } = useRaiseState(plan);
  const { investRate, raiserRate, servicerRate } = useRaiseRate(plan);

  const power = useMemo(() => +`${pack?.power || 0}`, [pack?.power]);
  const pledge = useMemo(() => toNumber(pack?.pledge), [pack?.pledge]);
  // 投资人持有算力
  const investPower = useMemo(() => accMul(accMul(power, accDiv(investRate, 100)), ratio), [power, ratio, investRate]);
  // 发起人持有算力
  const raiserPower = useMemo(() => (isRaiser ? accMul(power, accDiv(raiserRate, 100)) : 0), [power, raiserRate, isRaiser]);
  // 服务商持有算力
  const servicerPower = useMemo(() => (isServicer ? accMul(power, accDiv(servicerRate, 100)) : 0), [power, servicerRate, isServicer]);

  // 投资人持有质押币
  const investPledge = useMemo(() => accMul(accMul(pledge, accDiv(investRate, 100)), ratio), [pledge, ratio, investRate]);

  // 总持有算力
  const holdPower = useMemo(() => accAdd(accAdd(investPower, raiserPower), servicerPower), [investPower, raiserPower, servicerPower]);

  return {
    contract,
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
    holdPower,
  };
}
