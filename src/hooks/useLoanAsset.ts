import { useMemo } from 'react';
import { useDebounceEffect } from 'ahooks';
import { useQueries } from '@tanstack/react-query';

import useAccount from './useAccount';
import useContract from './useContract';
import useRaiseInfo from './useRaiseInfo';
import { withNull } from '@/utils/hackify';
import useLoanContract from './useLoanContract';
import { accAdd, accDiv, accSub } from '@/utils/utils';
import useRetrieverContract from './useRetrieverContract';

export default function useLoanAsset(id?: string, from?: string, to?: string) {
  const C = useContract();
  const loan = useLoanContract();
  const { address } = useAccount();
  const contract = useRetrieverContract();
  const { data: plan } = useRaiseInfo(id);

  const getPledgeAmount = async () => {
    if (id && address) {
      return await contract.getPledgeAmount(id, address);
    }
  };

  const getLeveragePledge = async () => {
    if (id && address) {
      return await contract.getLereragePledge(id, address);
    }
  };

  const getInvestorInfo = async () => {
    if (address && id && plan?.raise_address) {
      return await C.getInvestorInfo(id, address, plan.raise_address);
    }
  };

  const getFromAssets = async () => {
    if (address && from) {
      return await loan.getFromAssets(address, from);
    }
  };

  const getToAssets = async () => {
    if (address && to) {
      return await loan.getToAssets(address, to);
    }
  };

  const [pRes, lRes, iRes, fromRes, toRes] = useQueries({
    queries: [
      {
        queryKey: ['getPledgeAmount', address, id],
        queryFn: withNull(getPledgeAmount),
      },
      {
        queryKey: ['getLeveragePledge', address, id],
        queryFn: withNull(getLeveragePledge),
      },
      {
        queryKey: ['getInvestorInfo', address, id],
        queryFn: withNull(getInvestorInfo),
      },
      {
        queryKey: ['getFromAssets', address, from],
        queryFn: withNull(getFromAssets),
      },
      {
        queryKey: ['getToAssets', address, to],
        queryFn: withNull(getToAssets),
      },
    ],
  });

  const pledge = useMemo(() => pRes.data ?? 0, [pRes.data]); // 直接质押
  const leverage = useMemo(() => lRes.data ?? 0, [lRes.data]); // 杠杆质押
  const balance = useMemo(() => iRes.data?.[0] ?? 0, [iRes.data]); // 余额
  const toAssets = useMemo(() => toRes.data ?? [], [toRes.data]);
  const fromAssets = useMemo(() => fromRes.data ?? [], [fromRes.data]);
  const total = useMemo(() => accAdd(pledge, leverage), [leverage, pledge]); // 总质押
  const collateral = useMemo(() => Math.max(accSub(pledge, balance), 0), [balance, pledge]); // 已抵押
  const rate = useMemo(() => (pledge > 0 ? accDiv(collateral, pledge) : 0), [collateral, pledge]);

  const isError = useMemo(
    () => pRes.isError || lRes.isError || iRes.isError,
    [pRes.isError, lRes.isError, iRes.isError],
  );
  const isLoading = useMemo(
    () => pRes.isLoading || lRes.isLoading || iRes.isLoading,
    [pRes.isLoading, lRes.isLoading, iRes.isLoading],
  );

  const refetch = async () => {
    return Promise.all([pRes.refetch(), lRes.refetch(), iRes.refetch()]);
  };

  useDebounceEffect(
    () => {
      refetch();
    },
    [address, id],
    { wait: 200 },
  );

  useDebounceEffect(
    () => {
      fromRes.refetch();
    },
    [address, from],
    { wait: 200 },
  );

  useDebounceEffect(
    () => {
      toRes.refetch();
    },
    [address, to],
    { wait: 200 },
  );

  return {
    rate,
    total,
    pledge,
    balance,
    toAssets,
    fromAssets,
    collateral,
    leverage,
    isError,
    isLoading,
    refetch,
  };
}
