import { useEffect, useState } from 'react';

import useAccounts from './useAccounts';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import useEmittHandler from './useEmitHandler';
import useRaiseContract from './useRaiseContract';

export default function useRewardInvestor(data?: API.Plan) {
  const { account } = useAccounts();
  const { getContract } = useRaiseContract();

  const [total, setTotal] = useState(0); // 总收益
  const [reward, setReward] = useState(0); // 可提取
  const [record, setRecord] = useState(0); // 已提取
  const [pending, setPending] = useState(0); // 待释放

  const [loading, fetchData] = useLoadingify(async () => {
    if (!data) return;

    let total = 0;
    let reward = 0;
    let record = 0;
    let pending = 0;

    const contract = getContract(data.raise_address);

    if (account) {
      total = await contract?.totalRewardOf(data.raising_id, account);
      reward = await contract?.availableRewardOf(data.raising_id, account);
      // record = await contract?.withdrawRecord(data.raising_id, account);
      pending = await contract?.willReleaseOf(data.raising_id, account);
    }

    setTotal(toNumber(total));
    setReward(toNumber(reward));
    setRecord(toNumber(record));
    setPending(toNumber(pending));
  });

  const [processing, withdraw] = useProcessify(async () => {
    if (!data) return;

    const contract = getContract(data.raise_address);
    await contract?.investorWithdraw(data.raising_id);
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
