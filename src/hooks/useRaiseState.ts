import { useMemo } from 'react';

import { NodeState, RaiseState } from '@/constants/state';

/**
 * 节点计划状态及节点状态
 * @param data
 * @returns
 */
export default function useRaiseState(data?: API.Plan) {
  const raiseState = useMemo(() => data?.status ?? -1, [data?.status]); // 集合质押状态
  const nodeState = useMemo(() => data?.sealed_status ?? -1, [data?.sealed_status]); // 节点状态

  // 等待上链
  const isPending = useMemo(() => raiseState === 10, [raiseState]);
  // 等待开始
  const isWaiting = useMemo(() => raiseState === RaiseState.WaitingStart, [raiseState]);
  // 已开始
  const isStarted = useMemo(() => raiseState > RaiseState.WaitingStart && !isPending, [raiseState, isPending]);
  // 集合质押中
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
  // 预封装
  const isPreSeal = useMemo(() => isSuccess && nodeState === NodeState.PreSeal, [isSuccess, nodeState]);
  // 封装中
  const isSealing = useMemo(() => isSuccess && nodeState === NodeState.Started, [isSuccess, nodeState]);
  // 已延期
  const isDelayed = useMemo(() => isSuccess && nodeState === NodeState.Delayed, [isSuccess, nodeState]);
  // 封装完成
  const isFinished = useMemo(() => isSuccess && nodeState === NodeState.End, [isSuccess, nodeState]);
  // 工作中（产生节点激励）
  const isWorking = useMemo(() => isSuccess && nodeState >= NodeState.End && !isPreSeal, [isSuccess, nodeState, isPreSeal]);
  // 已销毁（节点运行结束）
  const isDestroyed = useMemo(() => isSuccess && nodeState === NodeState.Destroy, [isSuccess, nodeState]);

  return {
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
    isPreSeal,
    isSealing,
    isWorking,
    isDelayed,
    isFinished,
    isDestroyed,
  };
}
