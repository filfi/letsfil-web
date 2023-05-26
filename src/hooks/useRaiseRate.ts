import { useMemo } from 'react';

import * as U from '@/utils/utils';
import { toNumber } from '@/utils/format';

export default function useRaiseRate(data?: API.Plan) {
  const period = useMemo(() => data?.sector_period ?? 0, [data?.sector_period]);
  const income = useMemo(() => toNumber(data?.income_rate, 6), [data?.income_rate]);
  const actual = useMemo(() => toNumber(data?.actual_amount), [data?.actual_amount]);
  const target = useMemo(() => toNumber(data?.target_amount), [data?.target_amount]);
  const percent = useMemo(() => (target > 0 ? U.accDiv(actual, target) : 0), [actual, target]);
  const minRate = useMemo(() => U.accDiv(data?.min_raise_rate ?? 0, 100), [data?.min_raise_rate]);
  const reward = useMemo(() => U.accDiv(U.accMul(U.accMul(income, target), period), 360), [income, period, target]);
  // 优先部分
  const priorityRate = useMemo(() => data?.raiser_coin_share ?? 70, [data?.raiser_coin_share]);
  // 劣后部分
  const inferiorityRate = useMemo(() => U.accSub(100, priorityRate), [priorityRate]);
  // 保证金占比
  const opsRatio = useMemo(() => data?.ops_security_fund_rate ?? 5, [data?.ops_security_fund_rate]);
  // 投资人部分
  const investRate = useMemo(() => U.accMul(priorityRate, U.accDiv(U.accSub(100, opsRatio), 100)), [priorityRate, opsRatio]);
  // 保证金部分
  const opsRate = useMemo(() => U.accMul(priorityRate, U.accDiv(opsRatio, 100)), [priorityRate, opsRatio]);
  // 服务商权益
  const servicerRate = useMemo(() => data?.op_server_share ?? 5, [data?.op_server_share]);
  // filfi 协议部分
  const ffiRate = useMemo(() => U.accMul(inferiorityRate, 0.08), [inferiorityRate]);
  // 发起人部分
  const raiserRate = useMemo(() => U.accSub(U.accSub(inferiorityRate, ffiRate), servicerRate), [inferiorityRate, ffiRate, servicerRate]);

  return {
    actual,
    target,
    income,
    period,
    reward,
    minRate,
    percent,
    priorityRate,
    inferiorityRate,
    opsRatio,
    investRate,
    opsRate,
    servicerRate,
    ffiRate,
    raiserRate,
  };
}
