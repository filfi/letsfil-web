import { useEffect, useMemo, useState } from 'react';

import { accAdd } from '@/utils/utils';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import useEmittHandler from './useEmitHandler';
import useRaiseContract from './useRaiseContract';

export default function useRewardRaiser(data?: API.Plan) {
  const { getContract } = useRaiseContract();

  const [reward, setReward] = useState(0); // 可提取
  const [record, setRecord] = useState(0); // 已提取
  const [pending, setPending] = useState(0); // 待释放

  const total = useMemo(() => accAdd(accAdd(record, reward), pending), [record, reward, pending]);

  const [loading, fetchData] = useLoadingify(async () => {
    if (!data) return;

    const contract = getContract(data.raise_address);

    if (!contract) return;

    const reward = await contract.raiserRewardAvailableLeft(data.raising_id);
    const record = await contract.gotRaiserReward(data.raising_id);
    const pending = await contract.raiserWillReleaseReward(data.raising_id);

    setReward(toNumber(reward));
    setRecord(toNumber(record));
    setPending(toNumber(pending));
  });

  const [processing, withdraw] = useProcessify(async () => {
    if (!data) return;

    const contract = getContract(data.raise_address);
    await contract?.raiserWithdraw(data.raising_id);
  });

  useEffect(() => {
    fetchData();
  }, [data]);

  useEmittHandler({
    [EventType.onRaiserWithdraw]: fetchData,
  });

  return {
    total,
    record,
    reward,
    pending,
    loading,
    processing,
    withdraw,
    refresh: fetchData,
  };
}
