import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import useContract from './useContract';
import { withNull } from '@/utils/hackify';
import { isPending } from '@/helpers/raise';

/**
 * 节点计划的可转入Miner余额
 * @param data
 * @returns
 */
export default function useRaiseMiner(data?: API.Plan | null) {
  const contract = useContract(data?.raise_address);

  const getPledgeAmount = async () => {
    if (data && !isPending(data)) {
      return await contract.getPledgeAmount(data.raising_id);
    }
  };
  const getSealedAmount = async () => {
    if (data && !isPending(data)) {
      return await contract.getSealedAmount(data.raising_id);
    }
  };
  const getFundOpsCalc = async () => {
    if (data && !isPending(data)) {
      return await contract.getFundOpsCalc(data.raising_id);
    }
  };

  const [pRes, sRes, fRes] = useQueries({
    queries: [
      {
        queryKey: ['pledgeAmount', data?.raising_id],
        queryFn: withNull(getPledgeAmount),
        staleTime: 60_000,
      },
      {
        queryKey: ['sealedAmount', data?.raising_id],
        queryFn: withNull(getSealedAmount),
        staleTime: 60_000,
      },
      {
        queryKey: ['fundOpsCalc', data?.raising_id],
        queryFn: withNull(getFundOpsCalc),
        staleTime: 60_000,
      },
    ],
  });

  const funds = useMemo(() => fRes.data ?? 0, [fRes.data]);
  const pledge = useMemo(() => pRes.data ?? 0, [pRes.data]);
  const sealed = useMemo(() => sRes.data ?? 0, [sRes.data]);
  const isLoading = useMemo(() => fRes.isLoading || pRes.isLoading || sRes.isLoading, [fRes.isLoading, pRes.isLoading, sRes.isLoading]);

  const refetch = () => {
    return Promise.all([pRes.refetch(), sRes.refetch(), fRes.refetch()]);
  };

  return {
    funds,
    pledge,
    sealed,
    isLoading,
    refetch,
  };
}
