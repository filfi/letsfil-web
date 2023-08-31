import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import * as M from '@/helpers/mount';
import * as R from '@/helpers/raise';
import useContract from './useContract';
import { withNull } from '@/utils/hackify';

export default function useReleasedPledge(data?: API.Plan | null) {
  const contract = useContract(data?.raise_address);

  const getReleasedPledge = async () => {
    if (data && (M.isMountPlan(data) ? M.isWorking(data) : R.isWorking(data))) {
      return await contract.getReleasedPledge(data.raising_id);
    }
  };

  const [pRes] = useQueries({
    queries: [
      {
        queryKey: ['getReleasedPledge', data?.raising_id],
        queryFn: withNull(getReleasedPledge),
        staleTime: 60_000,
      },
    ],
  });

  const released = useMemo(() => pRes.data ?? 0, [pRes.data]);
  const isLoading = useMemo(() => pRes.isLoading, [pRes.isLoading]);

  const refetch = async () => {
    return Promise.all([pRes.refetch()]);
  };

  return {
    released,
    isLoading,
    refetch,
  };
}
