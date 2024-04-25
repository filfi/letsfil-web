import { useMemo } from 'react';
import { useUpdateEffect } from 'ahooks';
import { useQueries } from '@tanstack/react-query';

import { withNull } from '@/utils/hackify';
import useContract from '@/hooks/useContract';

export default function useRelease(address?: string, id?: string) {
  const contract = useContract();

  const getTotalPledge = async () => {
    if (id && address) {
      return await contract.getTotalPledge(id, address as any);
    }
  };

  const getReleasedPledge = async () => {
    if (id && address) {
      return await contract.getReleasedPledge(id, address as any);
    }
  };

  const [tRes, rRes] = useQueries({
    queries: [
      {
        queryFn: withNull(getTotalPledge),
        queryKey: ['getTotalPledge', id],
      },
      {
        queryFn: withNull(getReleasedPledge),
        queryKey: ['getReleasedPledge', id],
      },
    ],
  });

  const total = useMemo(() => tRes.data ?? 0, [tRes.data]); // 总质押
  const released = useMemo(() => rRes.data ?? 0, [rRes.data]); // 总释放

  const isError = useMemo(() => tRes.isError || rRes.isError, [tRes.isError, rRes.isError]);
  const isLoading = useMemo(() => tRes.isLoading || rRes.isLoading, [tRes.isLoading, rRes.isLoading]);

  const refresh = async () => {
    return await Promise.all([tRes.refetch(), rRes.refetch()]);
  };

  useUpdateEffect(() => {
    refresh();
  }, [address, id]);

  return {
    total,
    released,
    isError,
    isLoading,
    refresh,
  };
}
