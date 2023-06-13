import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import useAccount from './useAccount';
import useContract from './useContract';
import useRaiseRole from './useRaiseRole';
import { withNull } from '@/utils/hackify';
import useProcessify from './useProcessify';
import { accAdd, sleep } from '@/utils/utils';
import { isRaiseOperating } from '@/helpers/raise';

/**
 * 主办人节点激励
 * @param data
 * @returns
 */
export default function useRewardRaiser(data?: API.Plan | null) {
  const { withConnect } = useAccount();
  const { isRaiser } = useRaiseRole(data);
  const contract = useContract(data?.raise_address);

  const getRaiserAvailableReward = async () => {
    if (data && isRaiseOperating(data) && isRaiser) {
      return await contract.getRaiserAvailableReward(data.raising_id);
    }
  };
  const getRaiserPendingReward = async () => {
    if (data && isRaiseOperating(data) && isRaiser) {
      return await contract.getRaiserPendingReward(data.raising_id);
    }
  };
  const getRaiserWithdrawnReward = async () => {
    if (data && isRaiseOperating(data) && isRaiser) {
      return await contract.getRaiserWithdrawnReward(data.raising_id);
    }
  };

  const [usableRes, pendingRes, recordRes] = useQueries({
    queries: [
      {
        queryKey: ['raiserAvailableReward', data?.raising_id],
        queryFn: withNull(getRaiserAvailableReward),
        staleTime: 60_000,
      },
      {
        queryKey: ['raiserPendingReward', data?.raising_id],
        queryFn: withNull(getRaiserPendingReward),
        staleTime: 60_000,
      },
      {
        queryKey: ['raiserWithdrawnReward', data?.raising_id],
        queryFn: withNull(getRaiserWithdrawnReward),
        staleTime: 60_000,
      },
    ],
  });

  const reward = useMemo(() => usableRes.data ?? 0, [usableRes.data]); // 可提取
  const record = useMemo(() => recordRes.data ?? 0, [recordRes.data]); // 已提取
  const pending = useMemo(() => pendingRes.data ?? 0, [pendingRes.data]); // 待释放
  const total = useMemo(() => accAdd(record, reward, pending), [record, reward, pending]);

  const isLoading = useMemo(
    () => usableRes.isLoading || recordRes.isLoading || pendingRes.isLoading,
    [usableRes.isLoading, recordRes.isLoading, pendingRes.isLoading],
  );

  const refetch = () => {
    return Promise.all([usableRes.refetch(), recordRes.refetch(), pendingRes.refetch()]);
  };

  const [withdrawing, withdrawAction] = useProcessify(
    withConnect(async () => {
      if (!data) return;

      const res = await contract.raiserWithdraw(data.raising_id);

      await sleep(200);

      refetch();

      return res;
    }),
  );

  return {
    total,
    record,
    reward,
    pending,
    isLoading,
    withdrawing,
    withdrawAction,
    refetch,
  };
}
