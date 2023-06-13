import { useMemo } from 'react';
import { parseEther } from 'viem';
import { useQueries } from '@tanstack/react-query';

import { sleep } from '@/utils/utils';
import useAccount from './useAccount';
import useContract from './useContract';
import { toNumber } from '@/utils/format';
import { withNull } from '@/utils/hackify';
import useProcessify from './useProcessify';
import { isRaiserPaied } from '@/helpers/raise';

/**
 * 主办人的投资信息
 * @param data
 * @returns
 */
export default function useDepositRaiser(data?: API.Plan | null) {
  const { withConnect } = useAccount();
  const contract = useContract(data?.raise_address);

  const getFundRaiser = async () => {
    if (data && isRaiserPaied(data)) {
      return await contract.getFundRaiser(data.raising_id);
    }
  };
  const getTotalInterest = async () => {
    if (data && isRaiserPaied(data)) {
      return await contract.getTotalInterest(data.raising_id);
    }
  };

  const [fund, interest] = useQueries({
    queries: [
      {
        queryKey: ['fundRaiser', data?.raising_id],
        queryFn: withNull(getFundRaiser),
        staleTime: 60_000,
      },
      {
        queryKey: ['totalInterest', data?.raising_id],
        queryFn: withNull(getTotalInterest),
        staleTime: 60_000,
      },
    ],
  });

  const fines = useMemo(() => interest.data ?? 0, [interest.data]); // 罚息
  const amount = useMemo(() => fund.data ?? toNumber(data?.raise_security_fund), [fund.data, data?.raise_security_fund]); // 当前保证金
  const total = useMemo(() => toNumber(data?.raise_security_fund), [data?.raise_security_fund]); // 总保证金
  const isLoading = useMemo(() => fund.isLoading || interest.isLoading, [fund.isLoading, interest.isLoading]);

  const refetch = async () => {
    return Promise.all([fund.refetch(), interest.refetch()]);
  };

  const [paying, payAction] = useProcessify(
    withConnect(async () => {
      if (!data) return;

      const res = await contract.depositRaiserFund(data.raising_id, {
        value: parseEther(`${toNumber(data.raise_security_fund)}`),
      });

      await sleep(1_000);

      fund.refetch();

      return res;
    }),
  );

  const [withdrawing, withdrawAction] = useProcessify(
    withConnect(async () => {
      if (!data) return;

      const res = await contract.withdrawRaiserFund(data.raising_id);

      await sleep(200);

      fund.refetch();

      return res;
    }),
  );

  return {
    fines,
    total,
    amount,
    paying,
    isLoading,
    withdrawing,
    refetch,
    payAction,
    withdrawAction,
  };
}
