import { useMemo, useState } from 'react';
import { useAsyncEffect, useLockFn } from 'ahooks';

import { accAdd, isDef } from '@/utils/utils';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import useEmittHandler from './useEmitHandler';
import useRaiseContract from './useRaiseContract';

/**
 * 主办人节点激励
 * @param data
 * @returns
 */
export default function useRewardRaiser(data?: API.Plan) {
  const contract = useRaiseContract(data?.raise_address);

  const [reward, setReward] = useState(0); // 可提取
  const [record, setRecord] = useState(0); // 已提取
  const [pending, setPending] = useState(0); // 待释放

  const total = useMemo(() => accAdd(accAdd(record, reward), pending), [record, reward, pending]);

  const [loading, fetchData] = useLoadingify(
    useLockFn(async () => {
      if (!data?.raising_id) return;

      const reward = await contract.getRaiserAvailableReward(data.raising_id);
      const record = await contract.getRaiserWithdrawnReward(data.raising_id);
      const pending = await contract.getRaiserPendingReward(data.raising_id);

      isDef(reward) && setReward(toNumber(reward));
      isDef(record) && setRecord(toNumber(record));
      isDef(pending) && setPending(toNumber(pending));
    }),
  );

  const [processing, withdraw] = useProcessify(async () => {
    if (!data) return;

    await contract.raiserWithdraw(data.raising_id);
  });

  useAsyncEffect(fetchData, [data?.raising_id]);

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
