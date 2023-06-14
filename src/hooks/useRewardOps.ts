import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import useAccount from './useAccount';
import useContract from './useContract';
import useRaiseRate from './useRaiseRate';
import useRaiseRole from './useRaiseRole';
import { withNull } from '@/utils/hackify';
import useProcessify from './useProcessify';
import { isRaiseOperating } from '@/helpers/raise';
import { accDiv, accMul, accSub, sleep } from '@/utils/utils';

/**
 * 服务商节点激励
 * @param data
 * @returns
 */
export default function useRewardOps(data?: API.Plan | null) {
  const { withConnect } = useAccount();
  const { opsRate } = useRaiseRate(data);
  const { isServicer } = useRaiseRole(data);
  const contract = useContract(data?.raise_address);

  const getTotalReward = async () => {
    if (data && isRaiseOperating(data) && isServicer) {
      return await contract.getTotalReward(data.raising_id);
    }
  };
  const getOpsFines = async () => {
    if (data && isRaiseOperating(data) && isServicer) {
      return await contract.getOpsFines(data.raising_id);
    }
  };

  const [tRes, fRes] = useQueries({
    queries: [
      {
        queryKey: ['totalReward', data?.raising_id],
        queryFn: withNull(getTotalReward),
        staleTime: 60_000,
      },
      {
        queryKey: ['opsFines', data?.raising_id],
        queryFn: withNull(getOpsFines),
        staleTime: 60_000,
      },
    ],
  });

  const reward = useMemo(() => 0, []); // 可提取
  const record = useMemo(() => 0, []); // 已提取
  const _fines = useMemo(() => fRes.data ?? 0, [fRes.data]); // 保证金罚金
  const _total = useMemo(() => tRes.data ?? 0, [tRes.data]); // 总收益
  const pending = useMemo(() => Math.max(accSub(accMul(_total, accDiv(opsRate, 100)), _fines), 0), [fRes.data]); // 待释放

  const isLoading = useMemo(() => tRes.isLoading || fRes.isLoading, [tRes.isLoading, fRes.isLoading]);

  const refetch = () => {
    return Promise.all([tRes.refetch(), fRes.refetch()]);
  };

  const [withdarwing, withdrawAction] = useProcessify(
    withConnect(async () => {
      if (!data) return;

      const res = await contract.servicerWithdraw(data.raising_id);

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
    withdarwing,
    withdrawAction,
    refetch,
  };
}
