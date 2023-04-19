import { useEffect, useState } from 'react';

import useAccounts from './useAccounts';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useEmittHandler from './useEmitHandler';
import useDepositInvest from './useDepositInvest';

export default function useRewardInvestor(address: MaybeRef<string | undefined>) {
  const { accounts } = useAccounts();
  const { contract, isInvestor } = useDepositInvest(address);

  const [reward, setReward] = useState(0);
  const [record, setRecord] = useState(0);
  const [pending, setPending] = useState(0);
  const [available, setavailable] = useState(0);

  const fetchAmount = async () => {
    if (accounts[0]) {
      const reward = await contract.totalRewardOf(accounts[0]);
      const record = await contract.withdrawRecord(accounts[0]);
      const pending = await contract.pendingRewardOf(accounts[0]);
      const available = await contract.availableRewardOf(accounts[0]);

      setReward(toNumber(reward));
      setRecord(toNumber(record));
      setPending(toNumber(pending));
      setavailable(toNumber(available));
    }
  };

  useEffect(() => {
    fetchAmount();
  }, [address, accounts]);

  useEmittHandler({
    [EventType.onInvestorWithdraw]: fetchAmount,
  });

  return {
    contract,
    record,
    reward,
    pending,
    available,
    isInvestor,
  };
}
