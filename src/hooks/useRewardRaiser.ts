import { useEffect, useMemo, useState } from 'react';

import { accAdd } from '@/utils/utils';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useEmittHandler from './useEmitHandler';
import useDepositRaise from './useDepositRaise';
import useRaiseContract from './useRaiseContract';

export default function useRewardRaiser(data?: API.Plan) {
  const { getContract } = useRaiseContract();
  const { isRaiser } = useDepositRaise(data);

  const [record, setRecord] = useState(0); // 已提取
  const [pending, setPending] = useState(0); // 待释放
  const [available, setavailable] = useState(0); // 可提取

  const reward = useMemo(() => accAdd(accAdd(record, available), pending), [record, available, pending]);

  const [loading, fetchData] = useLoadingify(async () => {
    if (!data) return;

    let record = 0;
    let pending = 0;
    let available = 0;

    const contract = getContract(data.raise_address);

    if (isRaiser) {
      record = await contract?.gotRaiserReward(data.raising_id);
      pending = await contract?.raiserWillReleaseReward(data.raising_id);
      available = await contract?.raiserRewardAvailableLeft(data.raising_id);
    }

    setRecord(toNumber(record));
    setPending(toNumber(pending));
    setavailable(toNumber(available));
  });

  useEffect(() => {
    fetchData();
  }, [data]);

  useEmittHandler({
    [EventType.onRaiserWithdraw]: fetchData,
  });

  return {
    record,
    reward,
    pending,
    loading,
    isRaiser,
    available,
    refresh: fetchData,
  };
}
