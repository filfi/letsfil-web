import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import * as M from '@/helpers/mount';
import * as R from '@/helpers/raise';
import useContract from './useContract';
import { withNull } from '@/utils/hackify';

/**
 * 节点计划的节点激励
 * @param data
 * @returns
 */
export default function useRaiseReward(data?: API.Plan | null) {
  const contract = useContract(data?.raise_address);

  const getTotalReward = async () => {
    if (data && (M.isMountPlan(data) ? M.isWorking(data) : !R.isPending(data))) {
      return await contract.getTotalReward(data.raising_id);
    }
  };
  const getServicerFines = async () => {
    if (data && (M.isMountPlan(data) ? M.isWorking(data) : !R.isPending(data))) {
      return await contract.getServicerFines(data.raising_id);
    }
  };

  const [rewardRes, finesRes] = useQueries({
    queries: [
      {
        queryKey: ['getTotalReward', data?.raising_id],
        queryFn: withNull(getTotalReward),
        staleTime: 60_000,
      },
      {
        queryKey: ['getServicerFines', data?.raising_id],
        queryFn: withNull(getServicerFines),
        staleTime: 60_000,
      },
    ],
  });

  const fines = useMemo(() => finesRes.data ?? 0, [finesRes.data]);
  const reward = useMemo(() => rewardRes.data ?? 0, [rewardRes.data]);
  const isLoading = useMemo(() => finesRes.isLoading || rewardRes.isLoading, [finesRes.isLoading, rewardRes.isLoading]);

  const refetch = () => {
    return Promise.all([rewardRes.refetch(), finesRes.refetch()]);
  };

  return {
    fines,
    reward,
    isLoading,
    refetch,
  };
}
