import { useMemo } from 'react';

import { toNumber } from '@/utils/format';
import useRaiseBase from './useRaiseBase';
import useRaiseRate from './useRaiseRate';
import useRaiseRole from './useRaiseRole';
import useDepositInvestor from './useDepositInvestor';
import { accAdd, accDiv, accMul, accSub } from '@/utils/utils';

export default function useAssetPack(plan?: API.Plan | null, pack?: API.Pack | null) {
  const { actual } = useRaiseBase(plan);
  const { ratio, record } = useDepositInvestor(plan);
  const { isRaiser, isServicer } = useRaiseRole(plan);
  const { investRate, raiserRate, opsRate, servicerRate } = useRaiseRate(plan);

  const power = useMemo(() => +`${pack?.total_power || 0}`, [pack?.total_power]);
  const sector = useMemo(() => +`${pack?.total_sector || 0}`, [pack?.total_sector]);
  const pledge = useMemo(() => toNumber(pack?.total_pledge_amount), [pack?.total_pledge_amount]);

  // 封装算力
  const sealsPower = useMemo(() => accMul(power, ratio), [power, ratio]);
  // 建设者持有算力
  const investPower = useMemo(() => accMul(sealsPower, accDiv(investRate, 100)), [sealsPower, investRate]);
  // 主办人持有算力
  const raiserPower = useMemo(() => (isRaiser ? accMul(power, accDiv(raiserRate, 100)) : 0), [power, raiserRate, isRaiser]);
  // 运维保障金算力
  const opsPower = useMemo(() => accMul(power, accDiv(opsRate, 100)), [power, opsRate]);
  // 技术服务费算力
  const opsFeePower = useMemo(() => accMul(power, accDiv(servicerRate, 100)), [power, servicerRate]);
  // 服务商持有算力
  const servicerPower = useMemo(() => (isServicer ? accAdd(opsPower, opsFeePower) : 0), [opsPower, opsFeePower, isServicer]);

  // 主办人持有质押
  const raiserPledge = useMemo(() => 0, []);
  // 建设者持有质押
  const investPledge = useMemo(() => Math.min(accMul(pledge, ratio), record), [pledge, ratio, record]);
  // 服务商持有质押
  const servicerPledge = useMemo(() => (isServicer ? Math.max(accSub(pledge, actual), 0) : 0), [pledge, actual, isServicer]);

  // 总持有算力
  const holdPower = useMemo(() => accAdd(investPower, raiserPower, servicerPower), [investPower, raiserPower, servicerPower]);
  const holdPledge = useMemo(() => accAdd(investPledge, raiserPledge, servicerPledge), [investPledge, raiserPledge, servicerPledge]);

  return {
    power,
    pledge,
    sector,
    sealsPower,
    investPower,
    raiserPower,
    opsPower,
    opsFeePower,
    servicerPower,
    investPledge,
    raiserPledge,
    servicerPledge,
    holdPower,
    holdPledge,
  };
}
