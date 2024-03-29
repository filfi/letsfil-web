import { useMemo } from 'react';
import { useUnmount } from 'ahooks';
import { useQueries, useQueryClient } from '@tanstack/react-query';

import useAccount from './useAccount';
import useContract from './useContract';
import useRaiseRole from './useRaiseRole';
import { withNull } from '@/utils/hackify';
import { isPending } from '@/helpers/raise';
import useProcessify from './useProcessify';
import { accSub, sleep } from '@/utils/utils';

/**
 * 服务商节点激励
 * @param data
 * @returns
 */
export default function useRewardOps(data?: API.Plan | null) {
  const client = useQueryClient();
  const { withConnect } = useAccount();
  const { isServicer } = useRaiseRole(data);
  const contract = useContract(data?.raise_address);

  const getOpsFundReward = async () => {
    if (data && !isPending(data) && isServicer) {
      return await contract.getOpsFundReward(data.raising_id);
    }
  };
  const getOpsRewardFines = async () => {
    if (data && !isPending(data) && isServicer) {
      return await contract.getOpsRewardFines(data.raising_id);
    }
  };
  const getServicerFundReward = async () => {
    if (data && !isPending(data) && isServicer) {
      return await contract.getServicerFundReward(data.raising_id);
    }
  };

  const [rRes, fRes, sRes] = useQueries({
    queries: [
      {
        queryKey: ['getOpsFundReward', data?.raising_id],
        queryFn: withNull(getOpsFundReward),
      },
      {
        queryKey: ['getOpsRewardFines', data?.raising_id],
        queryFn: withNull(getOpsRewardFines),
      },
      {
        queryKey: ['getServicerFundReward', data?.raising_id],
        queryFn: withNull(getServicerFundReward),
      },
    ],
  });

  const fines = useMemo(() => fRes.data ?? 0, [fRes.data]); // 保证金罚金
  const reward = useMemo(() => rRes.data ?? 0, [rRes.data]); // 待释放
  const fundReward = useMemo(() => sRes.data ?? 0, [sRes.data]);
  const pending = useMemo(() => Math.max(accSub(reward, fines, fundReward), 0), [reward, fines, fundReward]);

  const isLoading = useMemo(() => rRes.isLoading || fRes.isLoading || sRes.isLoading, [rRes.isLoading, fRes.isLoading, sRes.isLoading]);

  const refetch = () => {
    return Promise.all([rRes.refetch(), fRes.refetch(), sRes.refetch()]);
  };

  useUnmount(() => {
    client.invalidateQueries({ queryKey: ['getOpsFundReward', data?.raising_id] });
    client.invalidateQueries({ queryKey: ['getOpsRewardFines', data?.raising_id] });
    client.invalidateQueries({ queryKey: ['getServicerFundReward', data?.raising_id] });
  });

  const [withdarwing, withdrawAction] = useProcessify(
    withConnect(async () => {
      if (!data) return;

      const res = await contract.servicerWithdraw(data.raising_id);

      await sleep(200);

      refetch();

      return res;
    }),
  );

  const [withdarwRewarding, withdrawRewardAction] = useProcessify(
    withConnect(async () => {
      if (!data) return;

      const res = await contract.withdrawOpsReward(data.raising_id);

      await sleep(200);

      refetch();

      return res;
    }),
  );

  return {
    fines,
    reward,
    pending,
    fundReward,
    isLoading,
    withdarwing,
    withdarwRewarding,
    withdrawAction,
    withdrawRewardAction,
    refetch,
  };
}
