import { useMemo } from 'react';
import { useUnmount } from 'ahooks';
import { useQueries, useQueryClient } from '@tanstack/react-query';

import { accAdd } from '@/utils/utils';
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
      return await contract.getPledgeTotalAmount(data.raising_id);
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
  const getOpsFundSafeRemain = async () => {
    if (data && !isPending(data)) {
      return await contract.getOpsFundSafeRemain(data.raising_id);
    }
  };
  const getOpsFundSafeSealed = async () => {
    if (data && !isPending(data)) {
      return await contract.getOpsFundSafeSealed(data.raising_id);
    }
  };

  const [pRes, sRes, fRes, oRes, safeRes] = useQueries({
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
        queryKey: ['getOpsFundSafeRemain', data?.raising_id],
        queryFn: withNull(getOpsFundSafeRemain),
      },
      {
        queryKey: ['getOpsFundSafeSealed', data?.raising_id],
        queryFn: withNull(getOpsFundSafeSealed),
      },
    ],
  });

  const funds = useMemo(() => fRes.data ?? 0, [fRes.data]);
  const pledge = useMemo(() => pRes.data ?? 0, [pRes.data]);
  const sealed = useMemo(() => sRes.data ?? 0, [sRes.data]);
  const safeRemain = useMemo(() => oRes.data ?? 0, [oRes.data]);
  const safeSealed = useMemo(() => safeRes.data ?? 0, [safeRes.data]);
  const safe = useMemo(() => accAdd(safeRemain, safeSealed), [safeRemain, safeSealed]);

  const isLoading = useMemo(
    () => fRes.isLoading || pRes.isLoading || sRes.isLoading || oRes.isLoading || safeRes.isLoading,
    [fRes.isLoading, pRes.isLoading, sRes.isLoading, oRes.isLoading, safeRes.isLoading],
  );

  const refetch = () => {
    return Promise.all([pRes.refetch(), sRes.refetch(), fRes.refetch(), oRes.refetch(), safeRes.refetch()]);
  };

  useUnmount(() => {
    client.invalidateQueries({ queryKey: ['getOpsFundCalc', data?.raising_id] });
    client.invalidateQueries({ queryKey: ['getPledgeAmount', data?.raising_id] });
    client.invalidateQueries({ queryKey: ['getSealedAmount', data?.raising_id] });
    client.invalidateQueries({ queryKey: ['getOpsFundSafeRemain', data?.raising_id] });
    client.invalidateQueries({ queryKey: ['getOpsFundSafeSealed', data?.raising_id] });
  });

  return {
    safe,
    funds,
    pledge,
    sealed,
    safeRemain,
    safeSealed,
    isLoading,
    refetch,
  };
}
