import { useMemo } from 'react';

import { isMountPlan } from '@/helpers/raise';
import { AssignState } from '@/constants/state';

/**
 * 分配计划状态及
 * @param data
 * @returns
 */
export default function useMountState(data?: API.Plan | null) {
  const isPending = useMemo(() => isMountPlan(data) && data?.assign_status === AssignState.Inactive, [data]);
  const isActive = useMemo(() => isMountPlan(data) && data?.assign_status === AssignState.Active, [data]);
  const isDone = useMemo(() => isMountPlan(data) && data?.assign_status === AssignState.Done, [data]);
  const isOver = useMemo(() => isMountPlan(data) && data?.assign_status === AssignState.Over, [data]);
  const isStarted = useMemo(() => data && isMountPlan(data) && data.assign_status >= AssignState.Active, [data]);
  const isWorking = useMemo(() => data && isMountPlan(data) && data.assign_status >= AssignState.Done, [data]);

  return {
    isActive,
    isDone,
    isOver,
    isPending,
    isStarted,
    isWorking,
  };
}
