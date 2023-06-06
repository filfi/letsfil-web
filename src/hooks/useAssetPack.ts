import { useMemo } from 'react';
import { useRequest } from 'ahooks';

import { packInfo } from '@/apis/packs';
import { toNumber } from '@/utils/format';
import useRaiseInfo from './useRaiseInfo';
import useRaiseRate from './useRaiseRate';
import useDepositInvestor from './useDepositInvestor';
import { accAdd, accDiv, accMul, accSub } from '@/utils/utils';

export default function useAssetPack(plan?: API.Plan) {
  const service = async () => {
    if (plan?.raising_id) {
      return await packInfo(plan.raising_id);
    }
  };

  const { data: pack, loading, refresh } = useRequest(service, { refreshDeps: [plan?.raising_id] });

  const { amount, ratio, record } = useDepositInvestor(plan);
  const { actual, isRaiser, isServicer } = useRaiseInfo(plan);
  const { investRate, raiserRate, opsRate, servicerRate } = useRaiseRate(plan);

  const power = useMemo(() => +`${pack?.total_power || 0}`, [pack?.total_power]);
  const sector = useMemo(() => +`${pack?.total_sector || 0}`, [pack?.total_sector]);
  const pledge = useMemo(() => toNumber(pack?.total_pledge_amount), [pack?.total_pledge_amount]);
  // 建设者持有算力
  const investPower = useMemo(() => accMul(power, accDiv(investRate, 100), ratio), [power, ratio, investRate]);
  // 主办人持有算力
  const raiserPower = useMemo(() => (isRaiser ? accMul(power, accDiv(raiserRate, 100)) : 0), [power, raiserRate, isRaiser]);
  // 服务商持有算力
  const servicerPower = useMemo(
    () => (isServicer ? accAdd(accMul(power, accDiv(servicerRate, 100)), accMul(power, accDiv(opsRate, 100))) : 0),
    [power, servicerRate, opsRate, isServicer],
  );

  // 主办人持有质押
  const raiserPledge = useMemo(() => 0, []);
  // 建设者持有质押
  const investPledge = useMemo(() => (pledge < actual ? accMul(pledge, ratio) : record), [pledge, ratio, record, actual]);
  // 服务商持有质押
  const servicerPledge = useMemo(() => (isServicer ? Math.max(accSub(pledge, actual), 0) : 0), [pledge, actual, isServicer]);

  // 总持有算力
  const holdPower = useMemo(() => accAdd(investPower, raiserPower, servicerPower), [investPower, raiserPower, servicerPower]);
  const holdPledge = useMemo(() => accAdd(investPledge, raiserPledge, servicerPledge), [investPledge, raiserPledge, servicerPledge]);

  return {
    pack,
    amount,
    ratio,
    power,
    pledge,
    sector,
    isRaiser,
    isServicer,
    investRate,
    raiserRate,
    servicerRate,
    investPower,
    raiserPower,
    servicerPower,
    investPledge,
    raiserPledge,
    servicerPledge,
    holdPower,
    holdPledge,
    loading,
    refresh,
  };
}
