import { useMemo } from 'react';

import * as H from '@/helpers/mount';

/**
 * 分配计划状态及
 * @param data
 * @returns
 */
export default function useMountState(data?: API.Plan | null) {
  const isInactive = useMemo(() => H.isMountPlan(data) && H.isInactive(data), [data]);
  const isActive = useMemo(() => H.isMountPlan(data) && H.isActive(data), [data]);
  const isDone = useMemo(() => H.isMountPlan(data) && H.isDone(data), [data]);
  const isOver = useMemo(() => H.isMountPlan(data) && H.isOver(data), [data]);
  const isStarted = useMemo(() => H.isMountPlan(data) && H.isStarted(data), [data]);
  const isWorking = useMemo(() => H.isMountPlan(data) && H.isWorking(data), [data]);

  return {
    isActive,
    isDone,
    isInactive,
    isOver,
    isStarted,
    isWorking,
  };
}
