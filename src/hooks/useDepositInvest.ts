import { ethers } from 'ethers';
import { useEffect, useMemo, useState } from 'react';

import { accSub } from '@/utils/utils';
import useAccounts from './useAccounts';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useDepositOps from './useDepositOps';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import useEmittHandler from './useEmitHandler';

export default function useDepositInvest(address: MaybeRef<string | undefined>) {
  const { accounts } = useAccounts();
  const { contract, amount: opsAmount, isOpsPayer } = useDepositOps(address);

  const [amount, setAmount] = useState(0);
  const [record, setRecord] = useState(0);
  const [totalPledge, setTotalPledge] = useState(0);
  // 投资成本。若是运维保证金支付人，则减去运维保证金
  const cost = useMemo(() => (isOpsPayer ? Math.max(accSub(amount, opsAmount), 0) : amount), [amount, opsAmount, isOpsPayer]);
  const isInvestor = useMemo(() => cost > 0, [cost]);

  const [fetching, fetchData] = useLoadingify(async () => {
    if (accounts[0]) {
      const amount = await contract.pledgeAmount(accounts[0]);
      const record = await contract.pledgeRecord(accounts[0]);

      setAmount(toNumber(amount));
      setRecord(toNumber(record));
    }

    const total = await contract.pledgeTotalAmount();

    setTotalPledge(toNumber(total));
  });

  const [loading, withdraw] = useProcessify(async () => {
    await contract.unStaking(ethers.utils.parseEther(`${cost}`));
  });

  useEffect(() => {
    fetchData();
  }, [address, accounts]);

  useEmittHandler({
    [EventType.onUnstaking]: fetchData,
    [EventType.onWithdrawOPSFund]: fetchData,
  });

  return {
    contract,
    amount,
    cost,
    record,
    totalPledge,
    isInvestor,
    fetching,
    loading,
    withdraw,
    refresh: fetchData,
  };
}
