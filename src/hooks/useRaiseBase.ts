import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import useContract from './useContract';
import { toNumber } from '@/utils/format';
import { withNull } from '@/utils/hackify';
import { accDiv, accMul } from '@/utils/utils';
import { isPending, isStarted, isSuccess } from '@/helpers/raise';

/**
 * 节点计划信息
 * @param data
 * @returns
 */
export default function useRaiseBase(data?: API.Plan | null) {
  const contract = useContract(data?.raise_address);

  const getOwner = async () => {
    if (data && !isPending(data)) {
      return await contract.getOwner();
    }
  };
  const getProgressEnd = async () => {
    if (data && !isPending(data)) {
      return await contract.getProgressEnd(data.raising_id);
    }
  };
  const getTotalPledge = async () => {
    if (data && isStarted(data)) {
      return await contract.getTotalPledge(data.raising_id);
    }
  };
  const getTotalSealed = async () => {
    if (data && isSuccess(data)) {
      return await contract.getTotalSealed(data.raising_id);
    }
  };

  const [oRes, eRes, pRes, sRes] = useQueries({
    queries: [
      {
        queryKey: ['getOwner', data?.raising_id],
        queryFn: withNull(getOwner),
        staleTime: 60_000,
      },
      {
        queryKey: ['getProgressEnd', data?.raising_id],
        queryFn: withNull(getProgressEnd),
        staleTime: 60_000,
      },
      {
        queryKey: ['getTotalPledge', data?.raising_id],
        queryFn: withNull(getTotalPledge),
        staleTime: 60_000,
      },
      {
        queryKey: ['getTotalSealed', data?.raising_id],
        queryFn: withNull(getTotalSealed),
        staleTime: 60_000,
      },
    ],
  });

  const sealed = useMemo(() => sRes.data ?? 0, [sRes.data]); // 已封装金额
  const hasOwner = useMemo(() => oRes.data ?? false, [oRes.data]); // owner权限
  const isProcessed = useMemo(() => eRes.data ?? false, [eRes.data]); // 是否已封装完成
  const sealsDays = useMemo(() => data?.seal_days ?? 0, [data?.seal_days]); // 承诺封装天数
  const actual = useMemo(() => pRes.data ?? toNumber(data?.actual_amount), [pRes.data, data?.actual_amount]); // 质押总额

  const period = useMemo(() => data?.sector_period ?? 0, [data?.sector_period]); // 扇区期限
  const minRate = useMemo(() => accDiv(data?.min_raise_rate ?? 0, 100), [data?.min_raise_rate]); // 最小质押比例
  const target = useMemo(() => toNumber(data?.target_amount), [data?.target_amount]); // 质押目标
  const minTarget = useMemo(() => accMul(target, minRate), [minRate, target]); // 最低目标

  const progress = useMemo(() => (target > 0 ? Math.min(accDiv(actual, target), 1) : 0), [actual, target]); // 质押进度
  const isLoading = useMemo(() => pRes.isLoading || sRes.isLoading, [pRes.isLoading, sRes.isLoading]);

  const refetch = async () => {
    return await Promise.all([oRes.refetch(), eRes.refetch(), pRes.refetch(), sRes.refetch()]);
  };

  return {
    actual,
    target,
    sealed,
    period,
    minRate,
    progress,
    hasOwner,
    minTarget,
    sealsDays,
    isLoading,
    isProcessed,
    refetch: refetch,
  };
}
