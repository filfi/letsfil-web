import { useMemo } from 'react';
// import { useDebounceEffect } from 'ahooks';
import { useQueries } from '@tanstack/react-query';

import useAccount from './useAccount';
import useContract from './useContract';
import useRaiseRate from './useRaiseRate';
import useRaiseRole from './useRaiseRole';
import { withNull } from '@/utils/hackify';
import useProcessify from './useProcessify';
import useRaiseReward from './useRaiseReward';
import { isRaiseOperating } from '@/helpers/raise';
import { accAdd, accDiv, accMul, accSub, sleep } from '@/utils/utils';

/**
 * 服务商节点激励
 * @param data
 * @returns
 */
export default function useRewardServicer(data?: API.Plan | null) {
  const { withConnect } = useAccount();
  const { isServicer } = useRaiseRole(data);
  const { opsRate, servicerRate } = useRaiseRate(data);
  const { fines, reward: _reward } = useRaiseReward(data);
  const contract = useContract(data?.raise_address);

  const getServicerAvailableReward = async () => {
    if (data && isRaiseOperating(data) && isServicer) {
      return await contract.getServicerAvailableReward(data.raising_id);
    }
  };
  const getServicerLockedReward = async () => {
    if (data && isRaiseOperating(data) && isServicer) {
      return await contract.getServicerLockedReward(data.raising_id);
    }
  };
  const getServicerPendingReward = async () => {
    if (data && isRaiseOperating(data) && isServicer) {
      return await contract.getServicerPendingReward(data.raising_id);
    }
  };
  const getServicerWithdrawnReward = async () => {
    if (data && isRaiseOperating(data) && isServicer) {
      return await contract.getServicerWithdrawnReward(data.raising_id);
    }
  };

  const [aRes, lRes, pRes, wRes] = useQueries({
    queries: [
      {
        queryKey: ['servicerAvailableReward', data?.raising_id],
        queryFn: withNull(getServicerAvailableReward),
        staleTime: 60_000,
      },
      {
        queryKey: ['servicerLockedReward', data?.raising_id],
        queryFn: withNull(getServicerLockedReward),
        staleTime: 60_000,
      },
      {
        queryKey: ['servicerPendingReward', data?.raising_id],
        queryFn: withNull(getServicerPendingReward),
        staleTime: 60_000,
      },
      {
        queryKey: ['servicerWithdrawnReward', data?.raising_id],
        queryFn: withNull(getServicerWithdrawnReward),
        staleTime: 60_000,
      },
    ],
  });

  const reward = useMemo(() => aRes.data ?? 0, [aRes.data]); // 可提取
  const _locked = useMemo(() => lRes.data ?? 0, [lRes.data]); // 锁定节点激励
  const record = useMemo(() => wRes.data ?? 0, [wRes.data]); // 已提取
  const pending = useMemo(() => pRes.data ?? 0, [pRes.data]); // 待释放

  // 总锁定部分
  const locked = useMemo(() => Math.max(accSub(accAdd(accMul(_reward, accDiv(opsRate, 100)), _locked), fines), 0), [fines, opsRate, _locked, _reward]);
  // 总收益
  const total = useMemo(() => Math.max(accSub(accMul(_reward, accDiv(accAdd(servicerRate, opsRate), 100)), fines), 0), [fines, opsRate, servicerRate, _reward]);
  const isLoading = useMemo(
    () => aRes.isLoading || lRes.isLoading || pRes.isLoading || wRes.isLoading,
    [aRes.isLoading, lRes.isLoading, pRes.isLoading, wRes.isLoading],
  );

  const refetch = () => {
    return Promise.all([aRes.refetch(), lRes.refetch(), pRes.refetch(), wRes.refetch()]);
  };

  // useDebounceEffect(() => {
  //   data && refetch();
  // }, [data], { wait: 200 });

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
    fines,
    total,
    locked,
    record,
    reward,
    pending,
    isLoading,
    withdarwing,
    withdrawAction,
    refetch,
  };
}
