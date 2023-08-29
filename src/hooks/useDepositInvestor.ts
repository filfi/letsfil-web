import { useMemo } from 'react';
import { parseEther } from 'viem';
import { useQueries } from '@tanstack/react-query';

import * as M from '@/helpers/mount';
import * as R from '@/helpers/raise';
import useAccount from './useAccount';
import useContract from './useContract';
import useRaiseBase from './useRaiseBase';
import { withNull } from '@/utils/hackify';
import useProcessify from './useProcessify';
import { accDiv, sleep } from '@/utils/utils';

/**
 * 建设者的投资信息
 * @param data
 * @returns
 */
export default function useDepositInvestor(data?: API.Plan | null) {
  const { address, withConnect } = useAccount();
  const contract = useContract(data?.raise_address);

  const { actual } = useRaiseBase(data);

  const getBackAssets = async () => {
    if (!address || !data) return;

    const isMount = M.isMountPlan(data);
    if (R.isClosed(data) || (isMount ? M.isWorking(data) : R.isFailed(data) || R.isWorking(data))) {
      return await contract.getBackAssets(data.raising_id, address);
    }
  };
  const getInvestInfo = async () => {
    if (!address || !data) return;

    const isMount = M.isMountPlan(data);
    if (isMount ? !M.isInactive(data) : !R.isPending(data)) {
      return await contract.getInvestorInfo(data.raising_id, address);
    }
  };

  const [backAsset, investorInfo] = useQueries({
    queries: [
      {
        queryKey: ['getBackAssets', address, data?.raising_id],
        queryFn: withNull(getBackAssets),
        staleTime: 60_000,
      },
      {
        queryKey: ['getInvestInfo', address, data?.raising_id],
        queryFn: withNull(getInvestInfo),
        staleTime: 60_000,
      },
    ],
  });

  const amount = useMemo(() => investorInfo.data?.[0] ?? 0, [investorInfo.data]); // 用户质押金额
  const record = useMemo(() => investorInfo.data?.[1] ?? 0, [investorInfo.data]); // 用户累计质押金额
  const withdraw = useMemo(() => investorInfo.data?.[3] ?? 0, [investorInfo.data]); // 用户已提取
  const backAmount = useMemo(() => backAsset.data?.[0] ?? 0, [backAsset.data]); // 退回金额
  const backInterest = useMemo(() => backAsset.data?.[1] ?? 0, [backAsset.data]); // 退回利息

  const isInvestor = useMemo(() => record > 0, [record]);
  const ratio = useMemo(() => (actual > 0 ? accDiv(record, actual) : 0), [record, actual]); // 投资占比

  const isLoading = useMemo(() => investorInfo.isLoading || backAsset.isLoading, [investorInfo.isLoading, backAsset.isLoading]);

  const refetch = async () => {
    return await investorInfo.refetch();
  };

  const [staking, stakeAction] = useProcessify(
    withConnect(async (amount: number | string) => {
      if (!data) return;

      const res = await contract.staking(data.raising_id, {
        value: parseEther(`${+amount}`),
      });

      await sleep(200);

      refetch();

      return res;
    }),
  );

  const [unstaking, unStakeAction] = useProcessify(
    withConnect(async () => {
      if (!data) return;

      const res = await contract.unStaking(data.raising_id);

      await sleep(200);

      refetch();

      return res;
    }),
  );

  return {
    ratio,
    amount,
    record,
    withdraw,
    backAmount,
    backInterest,
    isInvestor,
    staking,
    unstaking,
    isLoading,
    stakeAction,
    unStakeAction,
    refetch,
  };
}
