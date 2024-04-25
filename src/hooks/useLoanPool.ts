import { useMemo } from 'react';
import { useMount, useUnmount } from 'ahooks';
import { useQueries, useQueryClient } from '@tanstack/react-query';

import { ADDR_LOAN } from '@/constants';
import { toNumber } from '@/utils/format';
import { withNull } from '@/utils/hackify';
import useLoanContract from './useLoanContract';
import useWeb3Provider from './useWeb3Provider';
import { accDiv, accMul, sleep } from '@/utils/utils';
import useRetrieverContract from './useRetrieverContract';

export default function useLoanPool() {
  const client = useQueryClient();
  const loan = useLoanContract();
  const contract = useRetrieverContract();
  const { getProvider } = useWeb3Provider();

  const getLoanBalance = async () => {
    const provider = await getProvider();
    const val = await provider?.getBalance(ADDR_LOAN);

    return toNumber(val);
  };

  const [bRes, fRes, sRes, lRes, rRes, minRes, maxRes] = useQueries({
    queries: [
      {
        queryKey: ['getLoanBalance'],
        queryFn: withNull(getLoanBalance),
      },
      {
        queryKey: ['getFILPool'],
        queryFn: withNull(contract.getFILPool),
      },
      {
        queryKey: ['getAFILPool'],
        queryFn: withNull(contract.getAFILPool),
      },
      {
        queryKey: ['getLoanedFIL'],
        queryFn: withNull(contract.getLoanedFIL),
      },
      {
        queryKey: ['getLoanRate'],
        queryFn: withNull(loan.getLoanRate),
      },
      {
        queryKey: ['getLiquidity'],
        queryFn: withNull(loan.getLiquidity),
      },
      {
        queryKey: ['getMaxLoanable'],
        queryFn: withNull(loan.getMaxLoanable),
      },
    ],
  });

  const balance = useMemo(() => bRes.data ?? 0, [bRes.data]); // fil余额
  const fil = useMemo(() => fRes.data ?? 0, [fRes.data]); // fil
  const afil = useMemo(() => sRes.data ?? 0, [sRes.data]); // aFil
  const earnest = useMemo(() => accMul(fil, 0.1), [fil]); // 预留金
  const loaned = useMemo(() => lRes.data ?? 0, [lRes.data]); // 已借出
  const secRate = useMemo(() => rRes.data ?? 0, [rRes.data]); // 借款利率（每秒利率）
  const shifting = useMemo(() => minRes.data ?? 0, [minRes.data]); // 流动性
  const available = useMemo(() => maxRes.data ?? 0, [maxRes.data]); // 可借数量
  const loanRate = useMemo(() => accMul(secRate, 3600 * 24 * 365), [secRate]); // 借款利率（年利率）
  const factor = useMemo(() => (fil > 0 ? accDiv(loaned, fil) : 0), [fil, loaned]); // 利用率
  // const shifting = useMemo(() => Math.max(accSub(fil, loaned), 0), [fil, loaned]); // 流动性
  // const available = useMemo(() => Math.max(accSub(shifting, earnest), 0), [earnest, shifting]); // 可借数量
  const rate = useMemo(() => {
    const val = afil > 0 ? accDiv(fil, afil) : 0;
    return val === 0 ? 1 : val;
  }, [fil, afil]); // 汇率

  const isLoading = useMemo(
    () =>
      bRes.isLoading ||
      fRes.isLoading ||
      sRes.isLoading ||
      lRes.isLoading ||
      rRes.isLoading ||
      minRes.isLoading ||
      maxRes.isLoading,
    [
      bRes.isLoading,
      fRes.isLoading,
      sRes.isLoading,
      lRes.isLoading,
      rRes.isLoading,
      minRes.isLoading,
      maxRes.isLoading,
    ],
  );

  const refetch = async () => {
    return Promise.all([
      bRes.refetch(),
      fRes.refetch(),
      sRes.refetch(),
      lRes.refetch(),
      rRes.refetch(),
      minRes.refetch(),
      maxRes.refetch(),
    ]);
  };

  useMount(async () => {
    await sleep();
    refetch();
  });

  useUnmount(() => {
    client.invalidateQueries({ queryKey: ['getFILPool'] });
    client.invalidateQueries({ queryKey: ['getAFILPool'] });
    client.invalidateQueries({ queryKey: ['getLoanRate'] });
    client.invalidateQueries({ queryKey: ['getLoanedFIL'] });
    client.invalidateQueries({ queryKey: ['getLoanBalance'] });
    client.invalidateQueries({ queryKey: ['getLiquidity'] });
    client.invalidateQueries({ queryKey: ['getMaxLoanable'] });
  });

  return {
    fil,
    afil,
    rate,
    factor,
    loaned,
    balance,
    earnest,
    loanRate,
    shifting,
    available,
    isLoading,
    refetch,
  };
}
