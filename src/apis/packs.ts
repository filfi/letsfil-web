import * as A from '@/axios';

export function listPacks(params: API.PagingParams & { address: string }) {
  return A.get<API.PagingRes<API.Pack>>('/asset-pack/my-asset-pack-list', params);
}

export function packInfo(asset_pack_id: string) {
  return A.get<API.Pack>('/asset-pack/my-asset-pack-info', { asset_pack_id });
}

export function listActivities(params: API.PagingParams & { asset_pack_id: string; wallet_address: string }) {
  return A.get<API.PagingRes<API.Base>>('/asset-pack/customer-event-list', params);
}

export function listLoans(params: API.PagingParams & { address: string; miner_id?: string }) {
  return A.get<API.PagingRes<API.Plan>>('/asset-pack/can-stake-asset-pack-list', params);
}

export function dailyIncome(params: API.PagingParams & { asset_pack_id: string }) {
  return A.get<API.Base[]>('/asset-pack/asset-pack-daily-income', params);
}

export function getContractData(id: string) {
  return A.get<API.ContractData>('/asset-pack/asset-pack-contract-data', { asset_pack_id: id });
}

export function getExtInfo(id: string, address: string) {
  return A.get<{
    got_investor_reward: string;
    has_direct_pledge: number;
    has_leverage_pledge: number;
  }>('/asset-pack/my-asset-pack-ext-info', { raising_id: id, address });
}
