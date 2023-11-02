import * as A from '@/axios';

export function listReward(params: API.PagingParams & { miner_id: string }) {
  return A.get<API.PagingRes>('/miner/miner-reward-list', params);
}

export function listRelease(params: API.PagingParams & { miner_id: string; dedup_id: string }) {
  return A.get<API.PagingRes>('/miner/miner-reward-release-list', params);
}
