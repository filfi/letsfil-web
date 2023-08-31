import { AssignState } from '@/constants/state';

export function isMountPlan<T extends { plan_type: number }>(data?: T | null) {
  return data?.plan_type === 2;
}

export function isInactive<T extends { assign_status: number }>(data?: T | null) {
  return data?.assign_status === AssignState.Inactive;
}

export function isActive<T extends { assign_status: number }>(data?: T | null) {
  return data?.assign_status === AssignState.Active;
}

export function isDone<T extends { assign_status: number }>(data?: T | null) {
  return data?.assign_status === AssignState.Done;
}

export function isOver<T extends { assign_status: number }>(data?: T | null) {
  return data?.assign_status === AssignState.Over;
}

export function isStarted<T extends { assign_status: number }>(data?: T | null) {
  return !!data && data.assign_status >= AssignState.Active;
}

export function isWorking<T extends { assign_status: number }>(data?: T | null) {
  return !!data && data.assign_status >= AssignState.Done;
}
