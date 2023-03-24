import A from '@/axios';

export function providers() {
  return A.get<void, API.Base[]>('/service-provier/list');
}
