import { useMemo } from 'react';
import { useUnmount } from 'ahooks';
import { useQueries, useQueryClient } from '@tanstack/react-query';

import useContract from './useContract';
import { withNull } from '@/utils/hackify';
import { isPending } from '@/helpers/raise';

/**
 * 服务商的投资信息
 * @param data
 * @returns
 */
export default function useDepositServicer(data?: API.Plan | null) {
  const client = useQueryClient();
  const contract = useContract(data?.raise_address);

  const getServicerFines = async () => {
    if (data && !isPending(data)) {
      return await contract.getServicerFines(data.raising_id);
    }
  };
  const getTotalInterest = async () => {
    if (data && !isPending(data)) {
      return await contract.getTotalInterest(data.raising_id);
    }
  };

  const [fRes, tRes] = useQueries({
    queries: [
      {
        queryKey: ['getServicerFines', data?.raising_id],
        queryFn: withNull(getServicerFines),
      },
      {
        queryKey: ['getTotalInterest', data?.raising_id],
        queryFn: withNull(getTotalInterest),
      },
    ],
  });

  const fines = useMemo(() => fRes.data ?? 0, [fRes.data]); // 罚金
  const interest = useMemo(() => tRes.data ?? 0, [tRes.data]); // 总利息

  const isLoading = useMemo(() => fRes.isLoading || tRes.isLoading, [fRes.isLoading, tRes.isLoading]);

  const refetch = async () => {
    await Promise.all([fRes.refetch(), tRes.refetch()]);
  };

  useUnmount(() => {
    client.invalidateQueries({ queryKey: ['getServicerFines', data?.raising_id] });
    client.invalidateQueries({ queryKey: ['getTotalInterest', data?.raising_id] });
  });

  return {
    fines,
    interest,
    isLoading,
    refetch,
  };
}
