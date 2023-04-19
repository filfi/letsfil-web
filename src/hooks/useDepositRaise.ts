import { useEffect, useMemo, useState } from 'react';

import useAccounts from './useAccounts';
import { isEqual } from '@/utils/utils';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import useEmittHandler from './useEmitHandler';
import usePlanContract from './usePlanContract';

export default function useDepositRaise(address: MaybeRef<string | undefined>) {
  const { accounts } = useAccounts();
  const contract = usePlanContract(address);

  const [amount, setAmount] = useState(0);
  const [raiser, setRaiser] = useState('');
  const isRaiser = useMemo(() => isEqual(accounts[0], raiser), [accounts, raiser]);

  const [fetching, fetchData] = useLoadingify(async () => {
    const info = await contract.getRaiseInfo();

    setRaiser(info?.sponsor ?? '');

    if (accounts[0]) {
      const raise = await contract.getRaiseFund();

      setAmount(toNumber(raise));
    }
  });

  const [loading, withdraw] = useProcessify(async () => {
    await contract.withdrawRaiseFund();
  });

  useEffect(() => {
    fetchData();
  }, [address, accounts]);

  useEmittHandler({
    [EventType.onWithdrawRaiseFund]: fetchData,
  });

  return {
    contract,
    amount,
    raiser,
    isRaiser,
    fetching,
    loading,
    withdraw,
    refresh: fetchData,
  };
}
