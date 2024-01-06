import { useMemo } from 'react';
import { useUnmount } from 'ahooks';
import { useQueries, useQueryClient } from '@tanstack/react-query';

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
  const client = useQueryClient();
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

  const [rRes, fRes] = useQueries({
    queries: [
      {
        queryKey: ['getTotalReward', data?.raising_id],
        queryFn: withNull(getTotalReward),
      },
      {
        queryKey: ['getServicerFines', data?.raising_id],
        queryFn: withNull(getServicerFines),
      },
    ],
  });

  const fines = useMemo(() => fRes.data ?? 0, [fRes.data]);
  const reward = useMemo(() => rRes.data ?? 0, [rRes.data]);
  const isLoading = useMemo(() => fRes.isLoading || rRes.isLoading, [fRes.isLoading, rRes.isLoading]);

  const refetch = () => {
    return Promise.all([rRes.refetch(), fRes.refetch()]);
  };

  useUnmount(() => {
    client.invalidateQueries({ queryKey: ['getTotalReward', data?.raising_id] });
    client.invalidateQueries({ queryKey: ['getServicerFines', data?.raising_id] });
  });

  return {
    fines,
    reward,
    isLoading,
    refetch,
  };
}
