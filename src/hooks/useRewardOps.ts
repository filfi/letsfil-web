import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import { sleep } from '@/utils/utils';
import useAccount from './useAccount';
import useContract from './useContract';
import useRaiseRole from './useRaiseRole';
import { withNull } from '@/utils/hackify';
import { isSuccess } from '@/helpers/raise';
import useProcessify from './useProcessify';

/**
 * 服务商节点激励
 * @param data
 * @returns
 */
export default function useRewardOps(data?: API.Plan | null) {
  const { withConnect } = useAccount();
  // const { opsRate } = useRaiseRate(data);
  const { isServicer } = useRaiseRole(data);
  const contract = useContract(data?.raise_address);

  // const getTotalReward = async () => {
  //   if (data && isSuccess(data) && isServicer) {
  //     return await contract.getTotalReward(data.raising_id);
  //   }
  // };
  // const getOpsRewardFines = async () => {
  //   if (data && isSuccess(data) && isServicer) {
  //     return await contract.getOpsRewardFines(data.raising_id);
  //   }
  // };

  // const [tRes, fRes] = useQueries({
  //   queries: [
  //     {
  //       queryKey: ['getTotalReward', data?.raising_id],
  //       queryFn: withNull(getTotalReward),
  //       staleTime: 60_000,
  //     },
  //     {
  //       queryKey: ['getOpsRewardFines', data?.raising_id],
  //       queryFn: withNull(getOpsRewardFines),
  //       staleTime: 60_000,
  //     },
  //   ],
  // });

  const getOpsFundReward = async () => {
    if (data && isSuccess(data) && isServicer) {
      return await contract.getOpsFundReward(data.raising_id);
    }
  };

  const [oRes] = useQueries({
    queries: [
      {
        queryKey: ['getOpsFundReward', data?.raising_id],
        queryFn: withNull(getOpsFundReward),
        staleTime: 60_000,
      },
    ],
  });

  const reward = useMemo(() => 0, []); // 可提取
  const record = useMemo(() => 0, []); // 已提取
  const pending = useMemo(() => oRes.data ?? 0, [oRes.data]); // 待释放
  // const _fines = useMemo(() => fRes.data ?? 0, [fRes.data]); // 保证金罚金
  // const _total = useMemo(() => tRes.data ?? 0, [tRes.data]); // 总收益
  // const pending = useMemo(() => Math.max(accSub(accMul(_total, accDiv(opsRate, 100)), _fines), 0), [fRes.data]); // 待释放

  const isLoading = useMemo(() => oRes.isLoading, [oRes.isLoading]);

  const refetch = () => {
    return Promise.all([oRes.refetch()]);
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
