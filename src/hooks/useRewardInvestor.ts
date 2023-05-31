import { useEffect, useState } from 'react';

import useAccounts from './useAccounts';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import useEmittHandler from './useEmitHandler';
import useRaiseContract from './useRaiseContract';

/**
 * 投资人收益
 * @param data
 * @returns
 */
export default function useRewardInvestor(data?: API.Plan) {
  const { account } = useAccounts();
  const contract = useRaiseContract(data?.raise_address);

  const [total, setTotal] = useState(0); // 总收益
  const [reward, setReward] = useState(0); // 可提取
  const [record, setRecord] = useState(0); // 已提取
  const [pending, setPending] = useState(0); // 待释放

  const [loading, fetchData] = useLoadingify(async () => {
    if (!account || !data) return;

    const info = await contract.getInvestorInfo(data.raising_id, account);
    const total = await contract.getInvestorTotalReward(data.raising_id, account);
    const reward = await contract.getInvestorAvailableReward(data.raising_id, account);
    const pending = await contract.getInvestorPendingReward(data.raising_id, account);
    const record = info?.withdrawAmount;

    setTotal(toNumber(total));
    setReward(toNumber(reward));
    setRecord(toNumber(record));
    setPending(toNumber(pending));
  });

  const [processing, withdraw] = useProcessify(async () => {
    if (!data) return;

    await contract.investorWithdraw(data.raising_id);
  });

  useEffect(() => {
    fetchData();
  }, [account, data]);

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
