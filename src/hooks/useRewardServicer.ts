import { useEffect, useMemo, useState } from 'react';

import { accAdd } from '@/utils/utils';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useEmittHandler from './useEmitHandler';
import usePlanContract from './usePlanContract';
import type { MaybeRef } from './usePlanContract';

export default function useRewardServicer(address: MaybeRef<string | undefined>) {
  const contract = usePlanContract(address);

  const [record, setRecord] = useState(0);
  const [pending, setPending] = useState(0);
  const [available, setavailable] = useState(0);

  const reward = useMemo(() => accAdd(accAdd(record, available), pending), [record, available, pending]);

  const fetchAmount = async () => {
    const record = await contract.getServicerWithdrawnReward();
    const pending = await contract.getServicerPendingReward();
    const available = await contract.getServicerAvailableReward();

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
  };
}
