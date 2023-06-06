import { useState } from 'react';
import { useAsyncEffect } from 'ahooks';

import { isDef } from '@/utils/utils';
import useAccount from './useAccount';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import useEmittHandler from './useEmitHandler';
import useRaiseContract from './useRaiseContract';

/**
 * 建设者节点激励
 * @param data
 * @returns
 */
export default function useRewardInvestor(data?: API.Plan) {
  const { address } = useAccount();
  const contract = useRaiseContract(data?.raise_address);

  const [total, setTotal] = useState(0); // 总节点激励
  const [reward, setReward] = useState(0); // 可提取
  const [record, setRecord] = useState(0); // 已提取
  const [pending, setPending] = useState(0); // 待释放

  const [loading, fetchData] = useLoadingify(async () => {
    if (!address || !data?.raising_id) return;

    const info = await contract.getInvestorInfo(data.raising_id, address);
    const total = await contract.getInvestorTotalReward(data.raising_id, address);
    const reward = await contract.getInvestorAvailableReward(data.raising_id, address);
    const pending = await contract.getInvestorPendingReward(data.raising_id, address);
    const record = info?.withdrawAmount;

    isDef(total) && setTotal(toNumber(total));
    isDef(reward) && setReward(toNumber(reward));
    isDef(record) && setRecord(toNumber(record));
    isDef(pending) && setPending(toNumber(pending));
  });

  const [processing, withdraw] = useProcessify(async () => {
    if (!data) return;

    await contract.investorWithdraw(data.raising_id);
  });

  useAsyncEffect(fetchData, [address, data?.raising_id]);

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
