import { useMemo } from 'react';
import { parseEther } from 'viem';
import { useUnmount } from 'ahooks';
import { useQueries, useQueryClient } from '@tanstack/react-query';

import useAccount from './useAccount';
import useContract from './useContract';
import { toNumber } from '@/utils/format';
import { withNull } from '@/utils/hackify';
import useProcessify from './useProcessify';
import { accAdd, sleep } from '@/utils/utils';
import { safeAmount } from '@/constants/config';
import { isServicerPaied } from '@/helpers/raise';

/**
 * 保证金的投资信息
 * @param data
 * @returns
 */
export default function useDepositOps(data?: API.Plan | null) {
  const client = useQueryClient();
  const { withConnect } = useAccount();
  const contract = useContract(data?.raise_address);

  const getOpsFund = async () => {
    if (data && isServicerPaied(data)) {
      return await contract.getOpsFund(data.raising_id);
    }
  };
  const getOpsFundCalc = async () => {
    if (data && isServicerPaied(data)) {
      return await contract.getOpsFundCalc(data.raising_id);
    }
  };
  const getOpsFundNeed = async () => {
    if (data && isServicerPaied(data)) {
      return await contract.getOpsFundNeed(data.raising_id);
    }
  };
  const getOpsFundSeal = async () => {
    if (data && isServicerPaied(data)) {
      return await contract.getOpsFundSeal(data.raising_id);
    }
  };

  const [oRes, cRes, nRes, sRes] = useQueries({
    queries: [
      {
        queryKey: ['getOpsFund', data?.raising_id],
        queryFn: withNull(getOpsFund),
      },
      {
        queryKey: ['getOpsFundCalc', data?.raising_id],
        queryFn: withNull(getOpsFundCalc),
      },
      {
        queryKey: ['getOpsFundNeed', data?.raising_id],
        queryFn: withNull(getOpsFundNeed),
      },
      {
        queryKey: ['getOpsFundSeal', data?.raising_id],
        queryFn: withNull(getOpsFundSeal),
      },
    ],
  });

  const total = useMemo(() => toNumber(data?.ops_security_fund), [data?.ops_security_fund]); // 总保证金
  const actual = useMemo(() => cRes.data ?? 0, [cRes.data]); // 实际配比部分
  const amount = useMemo(() => oRes.data ?? total, [oRes.data, total]); // 当前保证金
  const need = useMemo(() => nRes.data ?? 0, [nRes.data]); // 需追加保证金
  const safe = useMemo(() => sRes.data ?? 0, [sRes.data]); // 缓冲金

  const isLoading = useMemo(
    () => cRes.isLoading || oRes.isLoading || nRes.isLoading || sRes.isLoading,
    [cRes.isLoading, oRes.isLoading, nRes.isLoading, sRes.isLoading],
  );

  const refetch = async () => {
    await Promise.all([cRes.refetch(), oRes.refetch(), nRes.refetch(), sRes.refetch()]);
  };

  useUnmount(() => {
    client.invalidateQueries({ queryKey: ['getOpsFund', data?.raising_id] });
    client.invalidateQueries({ queryKey: ['getOpsFundCalc', data?.raising_id] });
    client.invalidateQueries({ queryKey: ['getOpsFundNeed', data?.raising_id] });
    client.invalidateQueries({ queryKey: ['getOpsFundSeal', data?.raising_id] });
  });

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
    actual,
    amount,
    need,
    safe,
    total,
    isLoading,
    paying,
    withdrawing,
    payAction,
    withdrawAction,
    refetch,
  };
}
