import { useMemo } from 'react';
import { useRequest } from 'ahooks';

import useAccount from '@/hooks/useAccount';
import useRetrieverContract from '@/hooks/useRetrieverContract';

export default function useDeptInfo() {
  const { address } = useAccount();
  const contract = useRetrieverContract();

  const getInfo = async (fromId: string, toId: string) => {
    if (address) {
      return await contract.getLoanedDebt(address, fromId, toId);
    }
  };

  const { data, error, loading, run, refresh } = useRequest(getInfo, {
    manual: true,
  });

  const levers = useMemo(() => data?.[0] ?? 0, [data]);
  const pledge = useMemo(() => data?.[1] ?? 0, [data]);
  const interest = useMemo(() => data?.[2] ?? 0, [data]);
  const borrow = useMemo(() => data?.[3] ?? 0, [data]);

  return {
    data,
    borrow,
    levers,
    pledge,
    interest,
    error,
    loading,
    run,
    refresh,
  };
}
