import { useMemo } from 'react';
import { useUpdateEffect } from 'ahooks';
import { useQueries } from '@tanstack/react-query';

import { accMul } from '@/utils/utils';
import { withNull } from '@/utils/hackify';
import useAccount from '@/hooks/useAccount';
import useLoanContract from '@/hooks/useLoanContract';
import useRetrieverContract from '@/hooks/useRetrieverContract';

export default function useLoanAsset(from: string, to?: string) {
  const { address } = useAccount();
  const loan = useLoanContract();
  const contract = useRetrieverContract();

  const getClaimable = async () => {
    if (from && to) {
      return await loan.getClaimable(from, to);
    }
  };

  const getLoanedAssets = async () => {
    if (address && from && to) {
      return await contract.getLoanedAssets(address, from, to);
    }
  };

  const [cRes, aRes] = useQueries({
    queries: [
      {
        queryKey: ['getClaimable', from, to],
        queryFn: withNull(getClaimable),
      },
      {
        queryKey: ['getLoanedAssets', address, from, to],
        queryFn: withNull(getLoanedAssets),
      },
    ],
  });

  const assets = useMemo(() => aRes.data ?? [], [aRes.data]);
  const reward = useMemo(() => cRes.data ?? 0, [cRes.data]); // 可提取激励
  const toPledge = useMemo(() => assets[0] ?? 0, [assets]);
  const toRelease = useMemo(() => assets[1] ?? 0, [assets]);
  const toReward = useMemo(() => assets[2] ?? 0, [assets]);
  const fromPledge = useMemo(() => assets[3] ?? 0, [assets]);
  // const currPledge = useMemo(() => assets[4] ?? 0, [assets]);
  const fromRelease = useMemo(() => assets[4] ?? 0, [assets]);
  const fromReward = useMemo(() => assets[5] ?? 0, [assets]);
  const liability = useMemo(() => assets[6] ?? 0, [assets]); // 债务
  const interest = useMemo(() => assets[7] ?? 0, [assets]); // 利息
  const lockedReward = useMemo(() => assets[8] ?? 0, [assets]); // 锁定激励
  const drawnReward = useMemo(() => assets[9] ?? 0, [assets]); // 累计已提取激励
  const toPledgeCalc = useMemo(() => assets[10] ?? 0, [assets]); // 杠杆质押cal
  const fromPledgeCalc = useMemo(() => assets[11] ?? 0, [assets]); // 抵押资产cal
  const toPowerRate = useMemo(() => accMul(assets[12] ?? 0, Math.pow(10, 11)), [assets]); // 杠杆质押的分配比例
  const fromPowerRate = useMemo(() => accMul(assets[13] ?? 0, Math.pow(10, 11)), [assets]); // 抵押资产的分配比例

  const isError = useMemo(() => cRes.isError || aRes.isError, [cRes.isError, aRes.isError]);
  const isLoading = useMemo(() => cRes.isLoading || aRes.isLoading, [cRes.isLoading, aRes.isLoading]);

  const refetch = async () => {
    return Promise.all([cRes.refetch(), aRes.refetch()]);
  };

  useUpdateEffect(() => {
    refetch();
  }, [address, from, to]);

  return {
    assets,
    isError,
    isLoading,
    reward,
    toPledge,
    toRelease,
    toReward,
    toPledgeCalc,
    fromPledge,
    fromReward,
    fromRelease,
    fromPledgeCalc,
    // currPledge,
    liability,
    interest,
    drawnReward,
    lockedReward,
    toPowerRate,
    fromPowerRate,
    refetch,
  };
}
