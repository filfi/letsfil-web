import * as A from '@/axios';

export function getLoanRate() {
  return A.get<{ rate: string }>('/loan/qi/day/rate');
}
