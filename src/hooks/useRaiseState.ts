import { useEffect, useMemo, useState } from 'react';

import useAccounts from './useAccounts';
import { EventType } from '@/utils/mitt';
import useLoadingify from './useLoadingify';
import useEmittHandler from './useEmitHandler';
import useRaiseContract from './useRaiseContract';
import { NodeState, RaiseState } from '@/constants/state';

/**
 * 募集计划状态及节点状态
 * @param data
 * @returns
 */
export default function useRaiseState(data?: API.Plan) {
  const { account } = useAccounts();
  const contract = useRaiseContract(data?.raise_address);

  const [raiseState, setRaiseState] = useState(data?.status ?? -1);
  const [nodeState, setNodeState] = useState(data?.sealed_status ?? -1);

  // 等待上链
  const isPending = useMemo(() => raiseState === 10, [raiseState]);
  // 等待开始
  const isWaiting = useMemo(() => raiseState === RaiseState.WaitingStart, [raiseState]);
  // 已开始
  const isStarted = useMemo(() => raiseState > RaiseState.WaitingStart && !isPending, [raiseState, isPending]);
  // 募集中
  const isRaising = useMemo(() => raiseState === RaiseState.Raising, [raiseState]);
  // 已关闭
  const isClosed = useMemo(() => raiseState === RaiseState.Closed, [raiseState]);
  // 成功
  const isSuccess = useMemo(() => raiseState === RaiseState.Success, [raiseState]);
  // 已失败
  const isFailed = useMemo(() => raiseState === RaiseState.Failure, [raiseState]);
  // 处理中（封装和运行）
  const isProcess = useMemo(() => raiseState >= RaiseState.Success && !isPending, [raiseState, isPending]);
  // 等待封装
  const isWaitSeal = useMemo(() => isSuccess && nodeState === NodeState.WaitingStart, [isSuccess, nodeState]);
  // 封装中
  const isSealing = useMemo(() => isSuccess && nodeState === NodeState.Started, [isSuccess, nodeState]);
  // 已延期
  const isDelayed = useMemo(() => isSuccess && nodeState === NodeState.Delayed, [isSuccess, nodeState]);
  // 封装完成
  const isFinished = useMemo(() => isSuccess && nodeState === NodeState.End, [isSuccess, nodeState]);
  // 工作中（产生收益）
  const isWorking = useMemo(() => isSuccess && nodeState >= NodeState.End, [isSuccess, nodeState]);
  // 已销毁（节点运行结束）
  const isDestroyed = useMemo(() => isSuccess && nodeState === NodeState.Destroy, [isSuccess, nodeState]);

  const [loading, fetchData] = useLoadingify(async () => {
    if (!data) return;

    const nodeState = await contract.getNodeState(data.raising_id);
    const raiseState = await contract.getRaiseState(data.raising_id);

    setRaiseState(raiseState ?? data.status);
    setNodeState(nodeState ?? data.sealed_status);
  });

  useEffect(() => {
    fetchData();
  }, [account, data]);

  useEmittHandler({
    [EventType.onNodeStateChange]: fetchData,
    [EventType.onRaiseStateChange]: fetchData,
  });

  return {
    contract,
    loading,
    nodeState,
    raiseState,
    isClosed,
    isFailed,
    isWaiting,
    isStarted,
    isSuccess,
    isProcess,
    isPending,
    isRaising,
    isWaitSeal,
    isSealing,
    isWorking,
    isDelayed,
    isFinished,
    isDestroyed,
    refresh: fetchData,
  };
}
