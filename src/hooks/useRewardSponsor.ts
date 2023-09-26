import { useMemo } from 'react';
import { useUnmount, useUpdateEffect } from 'ahooks';
import { useQueries, useQueryClient } from '@tanstack/react-query';

import { sleep } from '@/utils/utils';
import useAccount from './useAccount';
import useContract from './useContract';
import useRaiseRole from './useRaiseRole';
import { withNull } from '@/utils/hackify';
import { isPending } from '@/helpers/raise';
import useProcessify from './useProcessify';
import useRaiseEquity from './useRaiseEquity';

/**
 * 主办人节点激励
 * @param data
 * @returns
 */
export default function useRewardRaiser(data?: API.Plan | null) {
  const client = useQueryClient();
  const { withConnect } = useAccount();
  const { isSuper } = useRaiseRole(data);
  const { sponsors, sponsor } = useRaiseEquity(data);
  const contract = useContract(data?.raise_address);

  const getSponsorAvailableReward = async () => {
    if (data && !isPending(data)) {
      if (Array.isArray(sponsors) && sponsors.length && sponsor) {
        return await contract.getSponsorAvailableReward(data.raising_id, sponsor.address);
      }

      if (isSuper) {
        return await contract.getRaiserAvailableReward(data.raising_id);
      }
    }
  };
  const getSponsorPendingReward = async () => {
    if (data && !isPending(data)) {
      if (Array.isArray(sponsors) && sponsors.length && sponsor) {
        return await contract.getSponsorPendingReward(data.raising_id, sponsor.address);
      }

      if (isSuper) {
        return await contract.getRaiserPendingReward(data.raising_id);
      }
    }
  };
  const getSponsorWithdrawnReward = async () => {
    if (data && !isPending(data)) {
      if (Array.isArray(sponsors) && sponsors.length && sponsor) {
        return await contract.getSponsorWithdrawnReward(data.raising_id, sponsor.address);
      }

      if (isSuper) {
        return await contract.getRaiserWithdrawnReward(data.raising_id);
      }
    }
  };

  const [aRes, pRes, wRes] = useQueries({
    queries: [
      {
        queryKey: ['getSponsorAvailableReward', data?.raising_id],
        queryFn: withNull(getSponsorAvailableReward),
      },
      {
        queryKey: ['getSponsorPendingReward', data?.raising_id],
        queryFn: withNull(getSponsorPendingReward),
      },
      {
        queryKey: ['getSponsorWithdrawnReward', data?.raising_id],
        queryFn: withNull(getSponsorWithdrawnReward),
      },
    ],
  });

  const reward = useMemo(() => aRes.data ?? 0, [aRes.data]); // 可提取
  const record = useMemo(() => wRes.data ?? 0, [wRes.data]); // 已提取
  const pending = useMemo(() => pRes.data ?? 0, [pRes.data]); // 待释放

  const isLoading = useMemo(() => aRes.isLoading || pRes.isLoading || wRes.isLoading, [aRes.isLoading, pRes.isLoading, wRes.isLoading]);

  const refetch = () => {
    return Promise.all([aRes.refetch(), pRes.refetch(), wRes.refetch()]);
  };

  useUpdateEffect(() => {
    refetch();
  }, [sponsor]);

  useUnmount(() => {
    client.invalidateQueries({ queryKey: ['getSponsorAvailableReward', data?.raising_id] });
    client.invalidateQueries({ queryKey: ['getSponsorPendingReward', data?.raising_id] });
    client.invalidateQueries({ queryKey: ['getSponsorWithdrawnReward', data?.raising_id] });
  });

  const [withdrawing, withdrawAction] = useProcessify(
    withConnect(async () => {
      if (!data || !sponsor) return;

      const res = await contract.sponsorWithdraw(data.raising_id, sponsor.address);

      await sleep(200);

      refetch();

      return res;
    }),
  );

  return {
    record,
    reward,
    pending,
    isLoading,
    withdrawing,
    withdrawAction,
    refetch,
  };
}
