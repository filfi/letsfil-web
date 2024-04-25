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

  const getBackAssets = async () => {
    if (address && data && !isPending(data)) {
      return await contract.getBackAssets(data.raising_id, address);
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
  // const getInvestorWithdrawnReward = async () => {
  //   if (address && data && !isPending(data)) {
  //     return await contract.getInvestorWithdrawnReward(data.raising_id, address);
  //   }
  // };

  const [bRes, aRes, pRes /* , wRes */] = useQueries({
    queries: [
      {
        queryKey: ['getBackAssets', address, data?.raising_id],
        queryFn: withNull(getBackAssets),
      },
      {
        queryKey: ['getInvestorAvailableReward', address, data?.raising_id],
        queryFn: withNull(getInvestorAvailableReward),
      },
      {
        queryKey: ['getInvestorPendingReward', address, data?.raising_id],
        queryFn: withNull(getInvestorPendingReward),
      },
      // {
      //   queryKey: ['getInvestorWithdrawnReward', address, data?.raising_id],
      //   queryFn: withNull(getInvestorWithdrawnReward),
      // },
    ],
  });

  const reward = useMemo(() => aRes.data ?? 0, [aRes.data]); // 可提取
  // const record = useMemo(() => wRes.data ?? 0, [wRes.data]); // 已提取
  const pending = useMemo(() => pRes.data ?? 0, [pRes.data]); // 待释放
  const backAmount = useMemo(() => bRes.data?.[0] ?? 0, [bRes.data]); // 退回资产
  const backInterest = useMemo(() => bRes.data?.[1] ?? 0, [bRes.data]); // 退回利息

  const isLoading = useMemo(
    () => bRes.isLoading || aRes.isLoading || pRes.isLoading /*  || wRes.isLoading */,
    [bRes.isLoading, aRes.isLoading, pRes.isLoading /* , wRes.isLoading */],
  );

  const refetch = () => {
    return Promise.all([bRes.refetch(), aRes.refetch(), pRes.refetch() /* , wRes.refetch() */]);
  };

  useUnmount(() => {
    client.invalidateQueries({ queryKey: ['getBackAssets', address, data?.raising_id] });
    client.invalidateQueries({ queryKey: ['getInvestorAvailableReward', address, data?.raising_id] });
    client.invalidateQueries({ queryKey: ['getInvestorPendingReward', address, data?.raising_id] });
    // client.invalidateQueries({ queryKey: ['getInvestorWithdrawnReward', address, data?.raising_id] });
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
    // record,
    reward,
    pending,
    backAmount,
    backInterest,
    isLoading,
    withdrawing,
    withdrawAction,
    refetch,
  };
}
