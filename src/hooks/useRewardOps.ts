import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import useAccount from './useAccount';
import useContract from './useContract';
import useRaiseRole from './useRaiseRole';
import { withNull } from '@/utils/hackify';
import { isSuccess } from '@/helpers/raise';
import useProcessify from './useProcessify';
import { accSub, sleep } from '@/utils/utils';

/**
 * 服务商节点激励
 * @param data
 * @returns
 */
export default function useRewardOps(data?: API.Plan | null) {
  const { withConnect } = useAccount();
  const { isServicer } = useRaiseRole(data);
  const contract = useContract(data?.raise_address);

  const getOpsFundReward = async () => {
    if (data && isSuccess(data) && isServicer) {
      return await contract.getOpsFundReward(data.raising_id);
    }
  };
  const getOpsRewardFines = async () => {
    if (data && isSuccess(data) && isServicer) {
      return await contract.getOpsRewardFines(data.raising_id);
    }
  };

  const [rRes, fRes] = useQueries({
    queries: [
      {
        queryKey: ['getOpsFundReward', data?.raising_id],
        queryFn: withNull(getOpsFundReward),
        staleTime: 60_000,
      },
      {
        queryKey: ['getOpsRewardFines', data?.raising_id],
        queryFn: withNull(getOpsRewardFines),
        staleTime: 60_000,
      },
    ],
  });

  const fines = useMemo(() => fRes.data ?? 0, [fRes.data]); // 保证金罚金
  const reward = useMemo(() => rRes.data ?? 0, [rRes.data]); // 待释放
  const pending = useMemo(() => Math.max(accSub(reward, fines), 0), [reward, fines]);

  const isLoading = useMemo(() => rRes.isLoading || fRes.isLoading, [rRes.isLoading, fRes.isLoading]);

  const refetch = () => {
    return Promise.all([rRes.refetch(), fRes.refetch()]);
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
    fines,
    reward,
    pending,
    isLoading,
    withdarwing,
    withdrawAction,
    refetch,
  };
}
