import { useEffect, useState } from 'react';

import useAccounts from './useAccounts';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useEmittHandler from './useEmitHandler';
import usePlanContract from './usePlanContract';
import type { MaybeRef } from './usePlanContract';

export default function useDepositRaise(address: MaybeRef<string | undefined>) {
  const { accounts } = useAccounts();
  const contract = usePlanContract(address);

  const [amount, setAmount] = useState(0);

  const fetchAmount = async () => {
    if (accounts[0]) {
      const raise = await contract.getRaiseFund();

      setAmount(toNumber(raise));
    }
  };

  const { loading, run: withdraw } = useLoadingify(async () => {
    await contract.withdrawRaiseFund();
  });

  useEffect(() => {
    fetchAmount();
  }, [address, accounts]);

  useEmittHandler({
    [EventType.onWithdrawRaiseFund]: fetchAmount,
  });

  return { contract, amount, loading, withdraw };
}
