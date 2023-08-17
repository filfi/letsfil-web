import { AssignState } from '@/constants/state';

export function isMountPlan(data?: API.Plan | null) {
  return data?.plan_type === 2;
}

export function isInactive(data?: API.Plan | null) {
  return data?.assign_status === AssignState.Inactive;
}

export function isActive(data?: API.Plan | null) {
  return data?.assign_status === AssignState.Active;
}

export function isDone(data?: API.Plan | null) {
  return data?.assign_status === AssignState.Done;
}

export function isOver(data?: API.Plan | null) {
  return data?.assign_status === AssignState.Over;
}

export function isStarted(data?: API.Plan | null) {
  return !!data && data.assign_status >= AssignState.Active;
}

export function isWorking(data?: API.Plan | null) {
  return !!data && data.assign_status >= AssignState.Done;
}
