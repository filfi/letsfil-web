import { useEffect, useState } from 'react';

import useAccounts from './useAccounts';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useEmittHandler from './useEmitHandler';
import useDepositInvest from './useDepositInvest';
import useRaiseContract from './useRaiseContract';

export default function useRewardInvestor(data?: API.Plan) {
  const { account } = useAccounts();
  const { getContract } = useRaiseContract();
  const { isInvestor } = useDepositInvest(data);

  const [reward, setReward] = useState(0); // 总收益
  const [record, setRecord] = useState(0); // 已提取
  const [pending, setPending] = useState(0); // 待释放
  const [available, setavailable] = useState(0); // 可提取

  const [loading, fetchData] = useLoadingify(async () => {
    if (!data) return;

    let reward = 0;
    let record = 0;
    let pending = 0;
    let available = 0;

    const contract = getContract(data.raise_address);

    if (account) {
      reward = await contract?.totalRewardOf(data.raising_id, account);
      record = await contract?.withdrawRecord(data.raising_id, account);
      pending = await contract?.pendingRewardOf(data.raising_id, account);
      available = await contract?.availableRewardOf(data.raising_id, account);
    }

    setReward(toNumber(reward));
    setRecord(toNumber(record));
    setPending(toNumber(pending));
    setavailable(toNumber(available));
  });

  useEffect(() => {
    fetchData();
  }, [account, data]);

  useEmittHandler({
    [EventType.onInvestorWithdraw]: fetchData,
  });

  return {
    account,
    record,
    reward,
    pending,
    loading,
    available,
    isInvestor,
    refresh: fetchData,
  };
}
