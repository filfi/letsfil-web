import { useEffect, useMemo, useState } from 'react';

import { accAdd } from '@/utils/utils';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useEmittHandler from './useEmitHandler';
import useDepositRaise from './useDepositRaise';

export default function useRewardRaiser(address: MaybeRef<string | undefined>) {
  const { contract, isRaiser } = useDepositRaise(address);

  const [record, setRecord] = useState(0);
  const [pending, setPending] = useState(0);
  const [available, setavailable] = useState(0);

  const reward = useMemo(() => accAdd(accAdd(record, available), pending), [record, available, pending]);

  const fetchAmount = async () => {
    const record = await contract.getRaiserWithdrawnReward();
    const pending = await contract.getRaiserPendingReward();
    const available = await contract.getRaiserAvailableReward();

    setRecord(toNumber(record));
    setPending(toNumber(pending));
    setavailable(toNumber(available));
  };

  useEffect(() => {
    fetchAmount();
  }, [address]);

  useEmittHandler({
    [EventType.onRaiserWithdraw]: fetchAmount,
  });

  return {
    contract,
    record,
    reward,
    pending,
    isRaiser,
    available,
  };
}
