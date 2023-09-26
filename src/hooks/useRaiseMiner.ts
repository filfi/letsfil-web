import { useMemo } from 'react';
import { useUnmount } from 'ahooks';
import { useQueries, useQueryClient } from '@tanstack/react-query';

import useContract from './useContract';
import { withNull } from '@/utils/hackify';
import { isPending } from '@/helpers/raise';

/**
 * 节点计划的可转入Miner余额
 * @param data
 * @returns
 */
export default function useRaiseMiner(data?: API.Plan | null) {
  const client = useQueryClient();
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
  const getOpsFundCalc = async () => {
    if (data && !isPending(data)) {
      return await contract.getOpsFundCalc(data.raising_id);
    }
  };
  const getOpsFundSeal = async () => {
    if (data && !isPending(data)) {
      return await contract.getOpsFundSeal(data.raising_id);
    }
  };

  const [pRes, sRes, fRes, oRes] = useQueries({
    queries: [
      {
        queryKey: ['getPledgeAmount', data?.raising_id],
        queryFn: withNull(getPledgeAmount),
      },
      {
        queryKey: ['getSealedAmount', data?.raising_id],
        queryFn: withNull(getSealedAmount),
      },
      {
        queryKey: ['getOpsFundCalc', data?.raising_id],
        queryFn: withNull(getOpsFundCalc),
      },
      {
        queryKey: ['getOpsFundSeal', data?.raising_id],
        queryFn: withNull(getOpsFundSeal),
      },
    ],
  });

  const safe = useMemo(() => oRes.data ?? 0, [oRes.data]);
  const funds = useMemo(() => fRes.data ?? 0, [fRes.data]);
  const pledge = useMemo(() => pRes.data ?? 0, [pRes.data]);
  const sealed = useMemo(() => sRes.data ?? 0, [sRes.data]);
  const isLoading = useMemo(
    () => fRes.isLoading || pRes.isLoading || sRes.isLoading || oRes.isLoading,
    [fRes.isLoading, pRes.isLoading, sRes.isLoading, oRes.isLoading],
  );

  const refetch = () => {
    return Promise.all([pRes.refetch(), sRes.refetch(), fRes.refetch(), oRes.isLoading]);
  };

  useUnmount(() => {
    client.invalidateQueries({ queryKey: ['getPledgeAmount', data?.raising_id] });
    client.invalidateQueries({ queryKey: ['getSealedAmount', data?.raising_id] });
    client.invalidateQueries({ queryKey: ['getOpsFundCalc', data?.raising_id] });
    client.invalidateQueries({ queryKey: ['getOpsFundSeal', data?.raising_id] });
  });

  return {
    safe,
    funds,
    pledge,
    sealed,
    isLoading,
    refetch,
  };
}
