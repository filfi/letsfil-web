import { useMemo } from 'react';

import * as H from '@/helpers/raise';
import { RaiseState } from '@/constants/state';

/**
 * 节点计划状态及节点状态
 * @param data
 * @returns
 */
export default function useRaiseState(data?: API.Plan | null) {
  const raiseState = useMemo(() => data?.status ?? -1, [data?.status]); // 集合质押状态
  const nodeState = useMemo(() => data?.sealed_status ?? -1, [data?.sealed_status]); // 节点状态

  // 等待上链
  const isPending = useMemo(() => data && H.isPending(data), [data]);
  // 等待开始
  const isWaiting = useMemo(() => data && H.isWaiting(data), [data]);
  // 已开始
  const isStarted = useMemo(() => data && H.isStarted(data), [data]);
  // 集合质押中
  const isRaising = useMemo(() => data && H.isRaising(data), [data]);
  // 已关闭
  const isClosed = useMemo(() => data && H.isClosed(data), [data]);
  // 已失败
  const isFailed = useMemo(() => data && H.isFailed(data), [data]);
  // 成功
  const isSuccess = useMemo(() => data && H.isSuccess(data), [data]);
  // 处理中（封装和运行）
  const isProcess = useMemo(() => raiseState >= RaiseState.Success && !isPending, [raiseState, isPending]);
  const isRunning = useMemo(() => data && H.isRunning(data), [data]);
  // 等待封装
  const isWaitSeal = useMemo(() => data && H.isWaitSeal(data), [data]);
  // 预封装
  const isPreSeal = useMemo(() => data && H.isPreSeal(data), [data]);
  // 封装中
  const isSealing = useMemo(() => data && H.isSealing(data), [data]);
  // 已延期
  const isDelayed = useMemo(() => data && H.isDelayed(data), [data]);
  // 封装完成
  const isFinished = useMemo(() => data && H.isFinished(data), [data]);
  // 工作中（产生节点激励）
  const isWorking = useMemo(() => data && H.isWorking(data), [data]);
  // 已销毁（节点运行结束）
  const isDestroyed = useMemo(() => data && H.isDestroyed(data), [data]);

  return {
    nodeState,
    raiseState,
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
    isPreSeal,
    isSealing,
    isWorking,
    isDelayed,
    isFinished,
    isDestroyed,
  };
}
