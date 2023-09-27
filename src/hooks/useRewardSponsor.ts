import { useUnmount } from 'ahooks';
import { useEffect, useMemo } from 'react';
import { useQueries, useQueryClient } from '@tanstack/react-query';

import { isDef, sleep } from '@/utils/utils';
import useAccount from './useAccount';
import useContract from './useContract';
import useRaiseRole from './useRaiseRole';
import { withNull } from '@/utils/hackify';
import { isPending } from '@/helpers/raise';
import useProcessify from './useProcessify';

const sponsorLimit = 0;

/**
 * 主办人节点激励
 * @param data
 * @returns
 */
export default function useRewardRaiser(data?: API.Plan | null) {
  const client = useQueryClient();
  const { withConnect } = useAccount();
  const contract = useContract(data?.raise_address);
  // const { sponsor } = useRaiseEquity(data);
  const { address, isRaiser } = useRaiseRole(data);

  const getSponsorAvailableReward = async () => {
    if (address && data && !isPending(data) && isRaiser) {
      const count = await contract.getSponsorNo(data.raising_id);

      if (!isDef(count)) return;

      if (count > sponsorLimit) {
        return await contract.getSponsorAvailableReward(data.raising_id, address);
      }

      return await contract.getRaiserAvailableReward(data.raising_id);
    }
  };
  const getSponsorPendingReward = async () => {
    if (address && data && !isPending(data) && isRaiser) {
      const count = await contract.getSponsorNo(data.raising_id);

      if (!isDef(count)) return;

      if (count > sponsorLimit) {
        return await contract.getSponsorPendingReward(data.raising_id, address);
      }

      return await contract.getRaiserPendingReward(data.raising_id);
    }
  };
  const getSponsorWithdrawnReward = async () => {
    if (address && data && !isPending(data) && isRaiser) {
      const count = await contract.getSponsorNo(data.raising_id);

      if (!isDef(count)) return;

      if (count > sponsorLimit) {
        return await contract.getSponsorWithdrawnReward(data.raising_id, address);
      }

      return await contract.getRaiserWithdrawnReward(data.raising_id);
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

  useEffect(() => {
    refetch();
  }, [address, data]);

  useUnmount(() => {
    client.invalidateQueries({ queryKey: ['getSponsorAvailableReward', data?.raising_id] });
    client.invalidateQueries({ queryKey: ['getSponsorPendingReward', data?.raising_id] });
    client.invalidateQueries({ queryKey: ['getSponsorWithdrawnReward', data?.raising_id] });
  });

  const [withdrawing, withdrawAction] = useProcessify(
    withConnect(async () => {
      if (!data || !address) return;

      let res;

      const count = await contract.getSponsorNo(data.raising_id);

      if (!isDef(count)) return;

      if (count > sponsorLimit) {
        res = await contract.sponsorWithdraw(data.raising_id, address);
      } else {
        res = await contract.raiserWithdraw(data.raising_id);
      }

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
