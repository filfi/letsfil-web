import { useMemo } from 'react';
// import { useDebounceEffect } from 'ahooks';
import { useQueries } from '@tanstack/react-query';

import { sleep } from '@/utils/utils';
import useAccount from './useAccount';
import useContract from './useContract';
import { withNull } from '@/utils/hackify';
import useProcessify from './useProcessify';
import { isRaiseOperating } from '@/helpers/raise';
import useDepositInvestor from './useDepositInvestor';

/**
 * 建设者节点激励
 * @param data
 * @returns
 */
export default function useRewardInvestor(data?: API.Plan | null) {
  const { address, withConnect } = useAccount();
  const { isInvestor } = useDepositInvestor(data);
  const contract = useContract(data?.raise_address);

  const getInvestorTotalReward = async () => {
    if (address && data && isRaiseOperating(data) && isInvestor) {
      return await contract.getInvestorTotalReward(data.raising_id, address);
    }
  };
  const getInvestorAvailableReward = async () => {
    if (address && data && isRaiseOperating(data) && isInvestor) {
      return await contract.getInvestorAvailableReward(data.raising_id, address);
    }
  };

  const [aRes, tRes] = useQueries({
    queries: [
      {
        queryKey: ['investorAvailableReward', address, data?.raising_id],
        queryFn: withNull(getInvestorAvailableReward),
        staleTime: 60_000,
      },
      {
        queryKey: ['investorTotalReward', address, data?.raising_id],
        queryFn: withNull(getInvestorTotalReward),
        staleTime: 60_000,
      },
    ],
  });

  const total = useMemo(() => tRes.data ?? 0, [tRes.data]); // 总节点激励
  const reward = useMemo(() => aRes.data ?? 0, [aRes.data]); // 可提取
  const record = useMemo(() => 0, []); // 已提取
  const pending = useMemo(() => 0, []); // 待释放

  const isLoading = useMemo(() => aRes.isLoading || tRes.isLoading, [aRes.isLoading, tRes.isLoading]);

  const refetch = () => {
    return Promise.all([aRes.refetch(), tRes.refetch()]);
  };

  // useDebounceEffect(() => {
  //   data && refetch();
  // }, [data], { wait: 200 });

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
