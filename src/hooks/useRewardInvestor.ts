import { useMemo } from 'react';
import { useUnmount } from 'ahooks';
import { useQueries, useQueryClient } from '@tanstack/react-query';

import { sleep } from '@/utils/utils';
import useAccount from './useAccount';
import useContract from './useContract';
import { withNull } from '@/utils/hackify';
import { isPending } from '@/helpers/raise';
import useProcessify from './useProcessify';

/**
 * 建设者节点激励
 * @param data
 * @returns
 */
export default function useRewardInvestor(data?: API.Plan | null) {
  const client = useQueryClient();
  const { address, withConnect } = useAccount();
  const contract = useContract(data?.raise_address);

  const getInvestInfo = async () => {
    if (address && data && !isPending(data)) {
      return await contract.getInvestorInfo(data.raising_id, address);
    }
  };
  const getInvestorAvailableReward = async () => {
    if (address && data && !isPending(data)) {
      return await contract.getInvestorAvailableReward(data.raising_id, address);
    }
  };
  const getInvestorPendingReward = async () => {
    if (address && data && !isPending(data)) {
      return await contract.getInvestorPendingReward(data.raising_id, address);
    }
  };

  const [iRes, aRes, pRes] = useQueries({
    queries: [
      {
        queryKey: ['getInvestInfo', address, data?.raising_id],
        queryFn: withNull(getInvestInfo),
      },
      {
        queryKey: ['getInvestorAvailableReward', address, data?.raising_id],
        queryFn: withNull(getInvestorAvailableReward),
      },
      {
        queryKey: ['getInvestorPendingReward', address, data?.raising_id],
        queryFn: withNull(getInvestorPendingReward),
      },
    ],
  });

  const reward = useMemo(() => aRes.data ?? 0, [aRes.data]); // 可提取
  const record = useMemo(() => iRes.data?.[3] ?? 0, [iRes.data]); // 已提取
  const pending = useMemo(() => pRes.data ?? 0, [pRes.data]); // 待释放

  const isLoading = useMemo(() => aRes.isLoading || iRes.isLoading || pRes.isLoading, [aRes.isLoading, iRes.isLoading, pRes.isLoading]);

  const refetch = () => {
    return Promise.all([aRes.refetch(), iRes.refetch(), pRes.refetch()]);
  };

  useUnmount(() => {
    client.invalidateQueries({ queryKey: ['getInvestInfo', address, data?.raising_id] });
    client.invalidateQueries({ queryKey: ['getInvestorAvailableReward', address, data?.raising_id] });
    client.invalidateQueries({ queryKey: ['getInvestorPendingReward', address, data?.raising_id] });
  });

  const [withdrawing, withdrawAction] = useProcessify(
    withConnect(async () => {
      if (!data) return;

      const res = await contract.investorWithdraw(data.raising_id);

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
