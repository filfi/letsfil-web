import { useEffect, useMemo, useState } from 'react';

import useAccounts from './useAccounts';
import { isEqual } from '@/utils/utils';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import useEmittHandler from './useEmitHandler';
import usePlanContract from './usePlanContract';

export default function useDepositOps(address: MaybeRef<string | undefined>) {
  const { accounts } = useAccounts();
  const contract = usePlanContract(address);

  const [amount, setAmount] = useState(0);
  const [opsPayer, setOpsPayer] = useState('');
  const isOpsPayer = useMemo(() => isEqual(accounts[0], opsPayer), [accounts, opsPayer]);

  const [fetching, fetchData] = useLoadingify(async () => {
    const info = await contract.getNodeInfo();

    setOpsPayer(info?.opsSecurityFundPayer ?? '');

    if (accounts[0]) {
      const ops = await contract.getOpsFund();

      setAmount(toNumber(ops));
    }
  });

  const [loading, withdraw] = useProcessify(async () => {
    await contract.withdrawOPSFund();
  });

  useEffect(() => {
    fetchData();
  }, [address, accounts]);

  useEmittHandler({
    [EventType.onWithdrawOPSFund]: fetchData,
  });

  return {
    contract,
    amount,
    opsPayer,
    isOpsPayer,
    fetching,
    loading,
    withdraw,
    refresh: fetchData,
  };
}
