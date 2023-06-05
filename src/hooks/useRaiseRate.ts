import { useMemo } from 'react';

import * as U from '@/utils/utils';

/**
 * 募集计划的各方权益
 * @param data
 * @returns
 */
export default function useRaiseRate(data?: API.Plan) {
  // 优先部分
  const priorityRate = useMemo(() => data?.raiser_coin_share ?? 70, [data?.raiser_coin_share]);
  // 劣后部分
  const inferiorityRate = useMemo(() => U.accSub(100, priorityRate), [priorityRate]);
  // 保证金占比
  const opsRatio = useMemo(() => data?.ops_security_fund_rate ?? 5, [data?.ops_security_fund_rate]);
  // 投资人权益
  const investRate = useMemo(() => U.accMul(priorityRate, U.accDiv(U.accSub(100, opsRatio), 100)), [priorityRate, opsRatio]);
  // 保证金权益
  const opsRate = useMemo(() => U.accMul(priorityRate, U.accDiv(opsRatio, 100)), [priorityRate, opsRatio]);
  // 服务商权益
  const servicerRate = useMemo(() => data?.op_server_share ?? 5, [data?.op_server_share]);
  // filfi 协议权益
  const ffiRate = useMemo(() => U.accMul(inferiorityRate, 0.08), [inferiorityRate]);
  // 发起人权益
  const raiserRate = useMemo(() => U.accSub(inferiorityRate, ffiRate, servicerRate), [inferiorityRate, ffiRate, servicerRate]);

  return {
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
