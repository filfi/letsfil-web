import { useState } from 'react';
import { useDebounceEffect } from 'ahooks';

import useAccount from './useAccount';
import useContract from './useContract';
import { EventType } from '@/utils/mitt';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import useEmittHandler from './useEmitHandler';
import { isDef, sleep } from '@/utils/utils';

/**
 * 建设者节点激励
 * @param data
 * @returns
 */
export default function useRewardInvestor(data?: API.Plan) {
  const { address, withConnect } = useAccount();
  const contract = useContract(data?.raise_address);

  const [total, setTotal] = useState(0); // 总节点激励
  const [reward, setReward] = useState(0); // 可提取
  const [record] = useState(0); // 已提取
  const [pending] = useState(0); // 待释放

  const [loading, fetchData] = useLoadingify(async () => {
    if (!address || !data?.raising_id) return;

    const [total, reward] = await Promise.all([
      contract.getInvestorTotalReward(data.raising_id, address),
      contract.getInvestorAvailableReward(data.raising_id, address),
    ]);

    isDef(total) && setTotal(total);
    isDef(reward) && setReward(reward);
  });

  const [processing, withdraw] = useProcessify(
    withConnect(async () => {
      if (!data) return;

      const res = await contract.investorWithdraw(data.raising_id);

      await sleep(200);
      fetchData();

      return res;
    }),
  );

  useDebounceEffect(
    () => {
      fetchData();
    },
    [address, data?.raising_id],
    { wait: 300, leading: true },
  );

  useEmittHandler({
    [EventType.onInvestorWithdraw]: fetchData,
  });

  return {
    total,
    record,
    reward,
    pending,
    loading,
    processing,
    withdraw,
    refresh: fetchData,
  };
}
