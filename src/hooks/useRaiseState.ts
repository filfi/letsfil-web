import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import * as H from '@/helpers/raise';
import { isDef } from '@/utils/utils';
import useContract from './useContract';
import { withNull } from '@/utils/hackify';
import { NodeState, RaiseState } from '@/constants/state';

/**
 * 节点计划状态及节点状态
 * @param data
 * @returns
 */
export default function useRaiseState(data?: API.Plan | null) {
  const { getPlanState } = useContract(data?.raise_address);
  const nodeState = useMemo(() => data?.sealed_status ?? -1, [data?.sealed_status]); // 节点状态

  const queryStateFn = async () => {
    if (data?.raising_id) {
      return await getPlanState(data.raising_id);
    }
  };

  const {
    data: planState,
    isError,
    isLoading,
    refetch,
  } = useQuery(['getPlanState', data?.raising_id], withNull(queryStateFn), {
    staleTime: 60_000,
  });

  // 等待上链
  const isPending = useMemo(() => isDef(data) && H.isPending(data), [data]);
  // 等待开始
  const isWaiting = useMemo(() => !isPending && planState === RaiseState.WaitingStart, [isPending, planState]);
  // 已开始
  const isStarted = useMemo(
    () => !isPending && isDef(planState) && planState > RaiseState.WaitingStart,
    [isPending, planState],
  );
  // 质押中
  const isRaising = useMemo(() => !isPending && planState === RaiseState.Raising, [isPending, planState]);
  // 已关闭
  const isClosed = useMemo(() => !isPending && planState === RaiseState.Closed, [isPending, planState]);
  // 已失败
  const isFailed = useMemo(() => !isPending && planState === RaiseState.Failure, [isPending, planState]);
  // 成功
  const isSuccess = useMemo(() => !isPending && planState === RaiseState.Success, [isPending, planState]);
  // 处理中（封装和运行）
  const isProcess = useMemo(
    () => !isPending && isDef(planState) && planState >= RaiseState.Success,
    [isPending, planState],
  );
  const isRunning = useMemo(() => isSuccess && nodeState >= NodeState.WaitingStart, [isSuccess, nodeState]);
  // 等待封装
  const isWaitSeal = useMemo(() => isSuccess && nodeState === NodeState.WaitingStart, [isSuccess, nodeState]);
  // 封装中
  const isSealing = useMemo(() => isStarted && nodeState === NodeState.Started, [isStarted, nodeState]);
  // 已延期
  const isDelayed = useMemo(() => isStarted && nodeState === NodeState.Delayed, [isStarted, nodeState]);
  // 封装完成
  const isFinished = useMemo(() => isSuccess && nodeState === NodeState.End, [isSuccess, nodeState]);
  // 已销毁（节点运行结束）
  const isDestroyed = useMemo(
    () => planState === RaiseState.Destroyed || (isSuccess && nodeState === NodeState.Destroy),
    [isSuccess, nodeState, planState],
  );
  // 工作中（产生节点激励）
  const isWorking = useMemo(() => isDestroyed || isFinished, [isDestroyed, isFinished]);

  return {
    nodeState,
    planState,
    isClosed,
    isFailed,
    isWaiting,
    isStarted,
    isSuccess,
    isProcess,
    isRunning,
    isPending,
    isRaising,
    isWaitSeal,
    isSealing,
    isWorking,
    isDelayed,
    isFinished,
    isDestroyed,
    isError,
    isLoading,
    refetch,
  };
}
