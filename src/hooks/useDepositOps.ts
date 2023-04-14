import { useEffect, useState } from 'react';

import useAccounts from './useAccounts';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useEmittHandler from './useEmitHandler';
import usePlanContract from './usePlanContract';
import type { MaybeRef } from './usePlanContract';

export default function useDepositOps(address: MaybeRef<string | undefined>) {
  const { accounts } = useAccounts();
  const contract = usePlanContract(address);

  const [amount, setAmount] = useState(0);

  const fetchAmount = async () => {
    if (accounts[0]) {
      const ops = await contract.getOpsFund();

      setAmount(toNumber(ops));
    }
  };

  const { loading, run: withdraw } = useLoadingify(async () => {
    await contract.withdrawOPSFund();
  });

  useEffect(() => {
    fetchAmount();
  }, [address, accounts]);

  useEmittHandler({
    [EventType.onWithdrawOPSFund]: fetchAmount,
  });

  return { contract, amount, loading, withdraw };
}
