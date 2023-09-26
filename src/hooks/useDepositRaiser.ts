import { useMemo } from 'react';
import { parseEther } from 'viem';
import { useUnmount } from 'ahooks';
import { useQueries, useQueryClient } from '@tanstack/react-query';

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
  const client = useQueryClient();
  const { withConnect } = useAccount();
  const contract = useContract(data?.raise_address);

  const getRaiserFund = async () => {
    if (data && isRaiserPaied(data)) {
      return await contract.getRaiserFund(data.raising_id);
    }
  };
  const getTotalInterest = async () => {
    if (data && isRaiserPaied(data)) {
      return await contract.getTotalInterest(data.raising_id);
    }
  };

  const [fRes, interest] = useQueries({
    queries: [
      {
        queryKey: ['getRaiserFund', data?.raising_id],
        queryFn: withNull(getRaiserFund),
      },
      {
        queryKey: ['getTotalInterest', data?.raising_id],
        queryFn: withNull(getTotalInterest),
      },
    ],
  });

  const fines = useMemo(() => interest.data ?? 0, [interest.data]); // 罚息
  const amount = useMemo(() => fRes.data ?? toNumber(data?.raise_security_fund), [fRes.data, data?.raise_security_fund]); // 当前保证金
  const total = useMemo(() => toNumber(data?.raise_security_fund), [data?.raise_security_fund]); // 总保证金
  const isLoading = useMemo(() => fRes.isLoading || interest.isLoading, [fRes.isLoading, interest.isLoading]);

  const refetch = async () => {
    return Promise.all([fRes.refetch(), interest.refetch()]);
  };

  useUnmount(() => {
    client.invalidateQueries({ queryKey: ['getRaiserFund', data?.raising_id] });
    client.invalidateQueries({ queryKey: ['getTotalInterest', data?.raising_id] });
  });

  const [paying, payAction] = useProcessify(
    withConnect(async () => {
      if (!data) return;

      const res = await contract.depositRaiserFund(data.raising_id, {
        value: parseEther(`${toNumber(data.raise_security_fund)}`),
      });

      await sleep(1_000);

      fRes.refetch();

      return res;
    }),
  );

  const [withdrawing, withdrawAction] = useProcessify(
    withConnect(async () => {
      if (!data) return;

      const res = await contract.withdrawRaiserFund(data.raising_id);

      await sleep(200);

      fRes.refetch();

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
