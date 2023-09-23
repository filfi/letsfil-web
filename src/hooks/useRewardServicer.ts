import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import useAccount from './useAccount';
import useContract from './useContract';
import useRaiseRole from './useRaiseRole';
import { withNull } from '@/utils/hackify';
import { isPending } from '@/helpers/raise';
import useProcessify from './useProcessify';
import { accAdd, accSub, sleep } from '@/utils/utils';

/**
 * 服务商节点激励
 * @param data
 * @returns
 */
export default function useRewardServicer(data?: API.Plan | null) {
  const { withConnect } = useAccount();
  const { isServicer } = useRaiseRole(data);
  const contract = useContract(data?.raise_address);

  const getServicerFinesReward = async () => {
    if (data && !isPending(data) && isServicer) {
      return await contract.getServicerFinesReward(data.raising_id);
    }
  };
  const getServicerLockedReward = async () => {
    if (data && !isPending(data) && isServicer) {
      return await contract.getServicerLockedReward(data.raising_id);
    }
  };
  const getServicerAvailableReward = async () => {
    if (data && !isPending(data) && isServicer) {
      return await contract.getServicerAvailableReward(data.raising_id);
    }
  };
  const getServicerPendingReward = async () => {
    if (data && !isPending(data) && isServicer) {
      return await contract.getServicerPendingReward(data.raising_id);
    }
  };
  const getServicerWithdrawnReward = async () => {
    if (data && !isPending(data) && isServicer) {
      return await contract.getServicerWithdrawnReward(data.raising_id);
    }
  };

  const [fRes, lRes, aRes, pRes, wRes] = useQueries({
    queries: [
      {
        queryKey: ['getServicerFinesReward', data?.raising_id],
        queryFn: withNull(getServicerFinesReward),
        staleTime: 60_000,
      },
      {
        queryKey: ['getServicerLockedReward', data?.raising_id],
        queryFn: withNull(getServicerLockedReward),
        staleTime: 60_000,
      },
      {
        queryKey: ['getServicerAvailableReward', data?.raising_id],
        queryFn: withNull(getServicerAvailableReward),
        staleTime: 60_000,
      },
      {
        queryKey: ['getServicerPendingReward', data?.raising_id],
        queryFn: withNull(getServicerPendingReward),
        staleTime: 60_000,
      },
      {
        queryKey: ['getServicerWithdrawnReward', data?.raising_id],
        queryFn: withNull(getServicerWithdrawnReward),
        staleTime: 60_000,
      },
    ],
  });

  const _fines = useMemo(() => fRes.data ?? 0, [fRes.data]); // 锁定节点激励
  const _locked = useMemo(() => lRes.data ?? 0, [lRes.data]); // 锁定节点激励
  const _pending = useMemo(() => pRes.data ?? 0, [pRes.data]); // 待释放
  const reward = useMemo(() => aRes.data ?? 0, [aRes.data]); // 可提取
  const record = useMemo(() => wRes.data ?? 0, [wRes.data]); // 已提取

  // 可领取
  const pending = useMemo(() => Math.max(accSub(accAdd(_pending, _locked), _fines), 0), [_pending, _locked, _fines]);

  const isLoading = useMemo(
    () => fRes.isLoading || lRes.isLoading || aRes.isLoading || pRes.isLoading || wRes.isLoading,
    [fRes.isLoading, lRes.isLoading, aRes.isLoading, pRes.isLoading, wRes.isLoading],
  );

  const refetch = () => {
    return Promise.all([fRes.refetch(), lRes.refetch(), aRes.refetch(), pRes.refetch(), wRes.refetch()]);
  };

  const [withdarwing, withdrawAction] = useProcessify(
    withConnect(async () => {
      if (!data) return;

      const res = await contract.servicerWithdraw(data.raising_id);

      await sleep(200);

      refetch();

      return res;
    }),
  );

  return {
    record,
    reward,
    pending,
    isLoading,
    withdarwing,
    withdrawAction,
    refetch,
  };
}
