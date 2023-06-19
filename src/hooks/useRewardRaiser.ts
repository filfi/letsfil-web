import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import { sleep } from '@/utils/utils';
import useAccount from './useAccount';
import useContract from './useContract';
import useRaiseRole from './useRaiseRole';
import { withNull } from '@/utils/hackify';
import useProcessify from './useProcessify';
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

  const [aRes, pRes, wRes] = useQueries({
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

  const reward = useMemo(() => aRes.data ?? 0, [aRes.data]); // 可提取
  const record = useMemo(() => wRes.data ?? 0, [wRes.data]); // 已提取
  const pending = useMemo(() => pRes.data ?? 0, [pRes.data]); // 待释放

  const isLoading = useMemo(() => aRes.isLoading || pRes.isLoading || wRes.isLoading, [aRes.isLoading, pRes.isLoading, wRes.isLoading]);

  const refetch = () => {
    return Promise.all([aRes.refetch(), pRes.refetch(), wRes.refetch()]);
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
    record,
    reward,
    pending,
    isLoading,
    withdrawing,
    withdrawAction,
    refetch,
  };
}
