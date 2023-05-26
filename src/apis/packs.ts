import * as A from '@/axios';

export function listPacks(params: API.PagingParams & { address: string }) {
  return A.get<API.PagingRes<API.Pack>>('/asset-pack/my-asset-pack-list', params);
}

export function packInfo(asset_pack_id: string) {
  return A.get<API.AssetPack>('/asset-pack/my-asset-pack-info', { asset_pack_id });
}

export function listActivities(params: API.PagingParams & { asset_pack_id: string; wallet_address: string }) {
  return A.get<API.PagingRes<API.Base>>('/asset-pack/customer-event-list', params);
}

export function dailyIncome(params: API.PagingParams & { asset_pack_id: string }) {
  return A.get<API.PagingRes<API.Base>>('/asset-pack/asset-pack-daily-income', params);
}
