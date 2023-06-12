import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import { accDiv } from '@/utils/utils';
import useContract from './useContract';
import { toNumber } from '@/utils/format';
import { withNull } from '@/utils/hackify';
import { isPending, isRaiseOperating, isStarted } from '@/helpers/raise';

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
  const getTotalPledge = async () => {
    if (data && isStarted(data)) {
      return await contract.getTotalPledge(data.raising_id);
    }
  };
  const getTotalSealed = async () => {
    if (data && isRaiseOperating(data)) {
      return await contract.getTotalSealed(data.raising_id);
    }
  };

  const [ownerRes, pledgeRes, sealedRes] = useQueries({
    queries: [
      {
        queryKey: ['raiseOwner', data?.raising_id],
        queryFn: withNull(getOwner),
        staleTime: 60_000,
      },
      {
        queryKey: ['raiseTotalPledge', data?.raising_id],
        queryFn: withNull(getTotalPledge),
        staleTime: 60_000,
      },
      {
        queryKey: ['raiseTotalSealed', data?.raising_id],
        queryFn: withNull(getTotalSealed),
        staleTime: 60_000,
      },
    ],
  });

  const sealed = useMemo(() => sealedRes.data ?? 0, [sealedRes.data]); // 已封装金额
  const hasOwner = useMemo(() => ownerRes.data ?? false, [ownerRes.data]); // owner权限
  const actual = useMemo(() => pledgeRes.data ?? toNumber(data?.actual_amount), [pledgeRes.data, data?.actual_amount]); // 质押总额

  const period = useMemo(() => data?.sector_period ?? 0, [data?.sector_period]); // 扇区期限
  const minRate = useMemo(() => accDiv(data?.min_raise_rate ?? 0, 100), [data?.min_raise_rate]); // 最小集合质押比例
  const target = useMemo(() => toNumber(data?.target_amount), [data?.target_amount]); // 质押目标

  const progress = useMemo(() => (target > 0 ? Math.min(accDiv(actual, target), 1) : 0), [actual, target]); // 集合质押进度
  const isLoading = useMemo(() => pledgeRes.isLoading || sealedRes.isLoading, [pledgeRes.isLoading, sealedRes.isLoading]);

  const refetch = async () => {
    return await Promise.all([ownerRes.refetch(), pledgeRes.refetch(), sealedRes.refetch()]);
  };

  return {
    actual,
    target,
    sealed,
    period,
    minRate,
    progress,
    hasOwner,
    isLoading,
    refetch: refetch,
  };
}
