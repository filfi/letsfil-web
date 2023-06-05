import { useMemo, useState } from 'react';
import { useAsyncEffect, useLockFn } from 'ahooks';

import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useRaiseRate from './useRaiseRate';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import useEmittHandler from './useEmitHandler';
import useRaiseContract from './useRaiseContract';
import { accAdd, accDiv, accMul, accSub, isDef } from '@/utils/utils';

/**
 * 服务商节点激励
 * @param data
 * @returns
 */
export default function useRewardServicer(data?: API.Plan) {
  const contract = useRaiseContract(data?.raise_address);

  const [fines, setFines] = useState(0); // 罚金
  const [reward, setReward] = useState(0); // 可提取
  const [record, setRecord] = useState(0); // 已提取
  const [pending, setPending] = useState(0); // 待释放
  const [rewardLock, setRewardLock] = useState(0);
  const [totalReward, setTotalReward] = useState(0); // 总节点激励

  const { opsRate, servicerRate } = useRaiseRate(data);

  const locked = useMemo(
    () => Math.max(accSub(accAdd(accMul(totalReward, accDiv(opsRate, 100)), rewardLock), fines), 0),
    [fines, opsRate, rewardLock, totalReward],
  );
  const total = useMemo(
    () => Math.max(accSub(accMul(totalReward, accDiv(accAdd(servicerRate, opsRate), 100)), fines), 0),
    [fines, opsRate, servicerRate, totalReward],
  );

  const [loading, fetchData] = useLoadingify(
    useLockFn(async () => {
      if (!data?.raising_id) return;

      const fines = await contract.getServicerFines(data.raising_id);
      const locked = await contract.getServicerLockedReward(data.raising_id);
      const reward = await contract.getServicerAvailableReward(data.raising_id);
      const record = await contract.getServicerWithdrawnReward(data.raising_id);
      const pending = await contract.getServicerPendingReward(data.raising_id);
      const totalReward = await contract.getTotalReward(data.raising_id);

      isDef(fines) && setFines(toNumber(fines));
      isDef(reward) && setReward(toNumber(reward));
      isDef(record) && setRecord(toNumber(record));
      isDef(pending) && setPending(toNumber(pending));
      isDef(locked) && setRewardLock(toNumber(locked));
      isDef(totalReward) && setTotalReward(toNumber(totalReward));
    }),
  );

  const [processing, withdraw] = useProcessify(async () => {
    if (!data) return;

    await contract.servicerWithdraw(data.raising_id);
  });

  useAsyncEffect(fetchData, [data?.raising_id]);

  useEmittHandler({
    [EventType.onServicerWithdraw]: fetchData,
  });

  return {
    fines,
    total,
    locked,
    record,
    reward,
    pending,
    loading,
    processing,
    withdraw,
    refresh: fetchData,
  };
}
