import { useMemo } from 'react';

import * as U from '@/utils/utils';
import { toFixed } from '@/utils/format';
import useRaiseEquity from './useRaiseEquity';
// import { isMountPlan } from '@/helpers/mount';

/**
 * 节点计划的各方权益
 * @param data
 * @returns
 */
export default function useRaiseRate(data?: API.Plan | null) {
  const { sponsorRate: raiserRate } = useRaiseEquity(data);

  // 精度
  const precision = 2; // useMemo(() => (isMountPlan(data) ? 5 : 2), [data]);
  // 优先部分
  const priorityRate = useMemo(() => U.accSub(data?.raiser_coin_share ?? 70, 0), [data?.raiser_coin_share]);
  // 劣后部分
  const inferiorityRate = useMemo(() => U.accSub(100, priorityRate), [priorityRate]);
  // 保证金占比
  const opsRatio = useMemo(() => U.accSub(data?.ops_security_fund_rate ?? 5, 0), [data?.ops_security_fund_rate]);
  // 建设者权益
  const investRate = useMemo(() => +toFixed(U.accMul(priorityRate, U.accDiv(U.accSub(100, opsRatio), 100)), precision), [priorityRate, opsRatio, precision]);
  // 保证金权益
  const opsRate = useMemo(() => +toFixed(U.accMul(priorityRate, U.accDiv(opsRatio, 100)), precision), [priorityRate, opsRatio, precision]);
  // 服务商权益
  const servicerRate = useMemo(() => U.accSub(data?.op_server_share ?? 5, 0), [data?.op_server_share]);
  // filfi 协议权益
  const ffiRate = useMemo(() => +toFixed(U.accMul(inferiorityRate, 0.08), precision, 2), [inferiorityRate, precision]);
  // 所有主办人权益
  const superRate = useMemo(() => U.accSub(inferiorityRate, ffiRate, servicerRate), [inferiorityRate, ffiRate, servicerRate]);

  return {
    priorityRate,
    inferiorityRate,
    opsRatio,
    investRate,
    opsRate,
    servicerRate,
    ffiRate,
    raiserRate,
    superRate,
  };
}
