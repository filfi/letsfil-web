import { useMemo, useState } from 'react';
import { useDebounceEffect } from 'ahooks';

import useAccount from './useAccount';
import useContract from './useContract';
import { EventType } from '@/utils/mitt';
import useRaiseRate from './useRaiseRate';
import useRaiseRole from './useRaiseRole';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import useEmittHandler from './useEmitHandler';
import { accAdd, accDiv, accMul, accSub, isDef } from '@/utils/utils';

/**
 * 服务商节点激励
 * @param data
 * @returns
 */
export default function useRewardServicer(data?: API.Plan) {
  const { withConnect } = useAccount();
  const { isServicer } = useRaiseRole(data);
  const contract = useContract(data?.raise_address);

  const [fines, setFines] = useState(0); // 罚金
  const [reward, setReward] = useState(0); // 可提取
  const [record, setRecord] = useState(0); // 已提取
  const [pending, setPending] = useState(0); // 待释放
  const [rewardLock, setRewardLock] = useState(0); // 锁定节点激励
  const [totalReward, setTotalReward] = useState(0); // 总节点激励

  const { opsRate, servicerRate } = useRaiseRate(data);

  // 总锁定部分
  const locked = useMemo(
    () => Math.max(accSub(accAdd(accMul(totalReward, accDiv(opsRate, 100)), rewardLock), fines), 0),
    [fines, opsRate, rewardLock, totalReward],
  );
  // 总收益
  const total = useMemo(
    () => Math.max(accSub(accMul(totalReward, accDiv(accAdd(servicerRate, opsRate), 100)), fines), 0),
    [fines, opsRate, servicerRate, totalReward],
  );

  const [loading, fetchData] = useLoadingify(async () => {
    if (!data?.raising_id || !isServicer) return;

    const [total, fines, locked, pending, reward, record] = await Promise.all([
      contract.getTotalReward(data.raising_id),
      contract.getServicerFines(data.raising_id),
      contract.getServicerLockedReward(data.raising_id),
      contract.getServicerPendingReward(data.raising_id),
      contract.getServicerAvailableReward(data.raising_id),
      contract.getServicerWithdrawnReward(data.raising_id),
    ]);

    isDef(fines) && setFines(fines);
    isDef(reward) && setReward(reward);
    isDef(record) && setRecord(record);
    isDef(pending) && setPending(pending);
    isDef(total) && setTotalReward(total);
    isDef(locked) && setRewardLock(locked);
  });

  const [processing, withdraw] = useProcessify(
    withConnect(async () => {
      if (!data) return;

      await contract.servicerWithdraw(data.raising_id);
    }),
  );

  useDebounceEffect(
    () => {
      fetchData();
    },
    [data?.raising_id, isServicer],
    { wait: 300, leading: true },
  );

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
