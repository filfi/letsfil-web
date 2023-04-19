import { useEffect, useMemo, useState } from 'react';

import { accAdd, isEqual } from '@/utils/utils';
import useAccounts from './useAccounts';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useEmittHandler from './useEmitHandler';
import usePlanContract from './usePlanContract';

export default function useRewardServicer(address: MaybeRef<string | undefined>) {
  const { accounts } = useAccounts();
  const contract = usePlanContract(address);

  const [record, setRecord] = useState(0);
  const [pending, setPending] = useState(0);
  const [available, setavailable] = useState(0);
  const [servicer, setServicer] = useState('');

  const reward = useMemo(() => accAdd(accAdd(record, available), pending), [record, available, pending]);
  const isServicer = useMemo(() => isEqual(accounts[0], servicer), [accounts, servicer]);

  const fetchAmount = async () => {
    const info = await contract.getRaiseInfo();
    const record = await contract.getServicerWithdrawnReward();
    const pending = await contract.getServicerPendingReward();
    const available = await contract.getServicerAvailableReward();

    setServicer(info?.spAddress ?? '');
    setRecord(toNumber(record));
    setPending(toNumber(pending));
    setavailable(toNumber(available));
  };

  useEffect(() => {
    fetchAmount();
  }, [address]);

  useEmittHandler({
    [EventType.onServicerWithdraw]: fetchAmount,
  });

  return {
    contract,
    record,
    reward,
    pending,
    available,
    isServicer,
  };
}
