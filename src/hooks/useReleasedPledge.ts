import { useMemo } from 'react';
import { useUnmount } from 'ahooks';
import { useQueries, useQueryClient } from '@tanstack/react-query';

import * as M from '@/helpers/mount';
import * as R from '@/helpers/raise';
import useContract from './useContract';
import { withNull } from '@/utils/hackify';

export default function useReleasedPledge(data?: API.Plan | null) {
  const client = useQueryClient();
  const contract = useContract(data?.raise_address);

  const getReleasedPledge = async () => {
    if (data && (M.isMountPlan(data) ? !M.isInactive(data) : !R.isPending(data))) {
      return await contract.getReleasedPledge(data.raising_id);
    }
  };

  const [pRes] = useQueries({
    queries: [
      {
        queryKey: ['getReleasedPledge', data?.raising_id],
        queryFn: withNull(getReleasedPledge),
      },
    ],
  });

  const released = useMemo(() => pRes.data ?? 0, [pRes.data]);
  const isLoading = useMemo(() => pRes.isLoading, [pRes.isLoading]);

  const refetch = async () => {
    return Promise.all([pRes.refetch()]);
  };

  useUnmount(() => {
    client.invalidateQueries({ queryKey: ['getReleasedPledge', data?.raising_id] });
  });

  return {
    released,
    isLoading,
    refetch,
  };
}
