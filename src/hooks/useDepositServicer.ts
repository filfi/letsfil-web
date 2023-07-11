import { useMemo } from 'react';
import { parseEther } from 'viem';
import { useQueries } from '@tanstack/react-query';

import useAccount from './useAccount';
import useContract from './useContract';
import { toNumber } from '@/utils/format';
import { withNull } from '@/utils/hackify';
import useProcessify from './useProcessify';
import { safeAmount } from '@/constants/config';
import { accAdd, accSub, sleep } from '@/utils/utils';
import { isServicerPaied, isStarted } from '@/helpers/raise';

/**
 * 服务商的投资信息
 * @param data
 * @returns
 */
export default function useDepositServicer(data?: API.Plan | null) {
  const { withConnect } = useAccount();
  const contract = useContract(data?.raise_address);

  const getOpsFund = async () => {
    if (data && isServicerPaied(data)) {
      return await contract.getOpsFund(data.raising_id);
    }
  };
  const getOpsCalcFund = async () => {
    if (data && isServicerPaied(data)) {
      return await contract.getOpsCalcFund(data.raising_id);
    }
  };
  const getOpsSafeFund = async () => {
    if (data && isServicerPaied(data)) {
      return await contract.getOpsSafeFund(data.raising_id);
    }
  };
  const getServicerFines = async () => {
    if (data && isStarted(data)) {
      return await contract.getServicerFines(data.raising_id);
    }
  };
  const getTotalInterest = async () => {
    if (data && isStarted(data)) {
      return await contract.getTotalInterest(data.raising_id);
    }
  };

  const [oRes, cRes, sRes, fRes, tRes] = useQueries({
    queries: [
      {
        queryKey: ['getOpsFund', data?.raising_id],
        queryFn: withNull(getOpsFund),
        staleTime: 60_000,
      },
      {
        queryKey: ['getOpsCalcFund', data?.raising_id],
        queryFn: withNull(getOpsCalcFund),
        staleTime: 60_000,
      },
      {
        queryKey: ['getOpsSafeFund', data?.raising_id],
        queryFn: withNull(getOpsSafeFund),
        staleTime: 60_000,
      },
      {
        queryKey: ['getServicerFines', data?.raising_id],
        queryFn: withNull(getServicerFines),
        staleTime: 60_000,
      },
      {
        queryKey: ['getTotalInterest', data?.raising_id],
        queryFn: withNull(getTotalInterest),
        staleTime: 60_000,
      },
    ],
  });

  const total = useMemo(() => toNumber(data?.ops_security_fund), [data?.ops_security_fund]); // 总保证金
  const safe = useMemo(() => sRes.data ?? 0, [sRes.data]); // 缓冲金
  const fines = useMemo(() => fRes.data ?? 0, [fRes.data]); // 罚金
  const actual = useMemo(() => cRes.data ?? 0, [cRes.data]); // 实际配比部分
  const interest = useMemo(() => tRes.data ?? 0, [tRes.data]); // 总利息
  const amount = useMemo(() => oRes.data ?? total, [oRes.data, total]); // 当前保证金

  const over = useMemo(() => Math.max(accSub(total, actual), 0), [actual, total]); // 超配部分
  const remain = useMemo(() => Math.max(accSub(actual, amount), 0), [actual, amount]); // 剩余部分

  const isLoading = useMemo(
    () => cRes.isLoading || fRes.isLoading || sRes.isLoading || oRes.isLoading || tRes.isLoading,
    [cRes.isLoading, fRes.isLoading, sRes.isLoading, oRes.isLoading, tRes.isLoading],
  );

  const refetch = async () => {
    await Promise.all([cRes.refetch(), fRes.refetch(), sRes.refetch(), oRes.refetch(), tRes.refetch()]);
  };

  const [paying, payAction] = useProcessify(
    withConnect(async () => {
      if (!data) return;

      const res = await contract.depositOpsFund(data.raising_id, {
        value: parseEther(`${accAdd(toNumber(data.ops_security_fund), safeAmount)}`),
      });

      await sleep(1_000);

      refetch();

      return res;
    }),
  );

  const [withdrawing, withdrawAction] = useProcessify(
    withConnect(async () => {
      if (!data) return;

      const res = await contract.withdrawOpsFund(data.raising_id);

      await sleep(200);

      refetch();

      return res;
    }),
  );

  return {
    fines,
    amount,
    over,
    safe,
    total,
    actual,
    remain,
    interest,
    isLoading,
    paying,
    withdrawing,
    payAction,
    withdrawAction,
    refetch,
  };
}
