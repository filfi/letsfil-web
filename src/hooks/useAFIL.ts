import { useMemo } from 'react';
import { useDebounceEffect, useUnmount } from 'ahooks';
import { useQueries, useQueryClient } from '@tanstack/react-query';

import useAccount from './useAccount';
import { withNull } from '@/utils/hackify';
import useRetrieverContract from './useRetrieverContract';

export default function useAFIL() {
  const client = useQueryClient();
  const { address } = useAccount();
  const { getAFILBalance } = useRetrieverContract();

  const getBalance = async () => {
    if (address) {
      return await getAFILBalance(address);
    }
  };

  const [bRes] = useQueries({
    queries: [
      {
        queryKey: ['getAFILBalance'],
        queryFn: withNull(getBalance),
      },
    ],
  });

  const amount = useMemo(() => bRes.data ?? 0, [bRes.data]);

  const isLoading = useMemo(() => bRes.isLoading, [bRes.isLoading]);

  const refetch = async () => {
    return await Promise.all([bRes.refetch()]);
  };

  useDebounceEffect(() => {
    refetch();
  }, [address]);

  useUnmount(() => {
    client.invalidateQueries({ queryKey: ['getAFILBalance'] });
  });

  return {
    amount,
    isLoading,
    refetch,
  };
}
