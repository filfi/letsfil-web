import { useMemo } from 'react';
import { useDebounceEffect } from 'ahooks';
import { useQueries } from '@tanstack/react-query';

import useAccount from './useAccount';
import { accMul } from '@/utils/utils';
import { withNull } from '@/utils/hackify';
import useRetrieverContract from './useRetrieverContract';

export default function useUserAssets(id?: string) {
  const C = useRetrieverContract();
  const { address } = useAccount();

  const getUserAssets = async () => {
    if (address && id) {
      return await C.getUserAsset(address, id);
    }
  };

  const [res] = useQueries({
    queries: [
      {
        queryKey: ['getUserAssets', address, id],
        queryFn: withNull(getUserAssets),
        staleTime: 60_000,
      },
    ],
  });

  const { isError, isLoading, refetch } = res;

  const assets = useMemo(() => res.data ?? [], [res.data]);
  const pledge = useMemo(() => assets[1] ?? 0, [assets]); // 直接质押
  const sealedPledge = useMemo(() => assets[0] ?? 0, [assets]); // 直接质押 - 已封装
  const collateral = useMemo(() => assets[3] ?? 0, [assets]); // 抵押品质呀
  const sealedCollateral = useMemo(() => assets[2] ?? 0, [assets]); // 抵押品质押 - 已封装
  const leverage = useMemo(() => assets[5] ?? 0, [assets]); // 杠杆质押
  const sealedLeverage = useMemo(() => assets[4] ?? 0, [assets]); // 杠杆质押 - 已封装
  const pledgeRate = useMemo(() => accMul(assets[6] ?? 0, Math.pow(10, 11)), [assets]); // 直接质押 - 挂载节点分配比例
  const collateralRate = useMemo(() => accMul(assets[7] ?? 0, Math.pow(10, 11)), [assets]); // 抵押品质押 - 挂载节点分配比例
  const leverageRate = useMemo(() => accMul(assets[8] ?? 0, Math.pow(10, 11)), [assets]); // 杠杆质押质押 - 挂载节点分配比例

  useDebounceEffect(
    () => {
      refetch();
    },
    [address, id],
    { wait: 300 },
  );

  return {
    assets,
    pledge,
    leverage,
    collateral,
    sealedPledge,
    sealedLeverage,
    sealedCollateral,
    pledgeRate,
    leverageRate,
    collateralRate,
    isError,
    isLoading,
    refetch,
  };
}
