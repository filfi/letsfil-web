import * as A from '@/axios';

export function listPacks(params: API.PagingParams & { address: string }) {
  return A.get<API.PagingRes<API.Pack>>('/asset-pack/my-asset-pack-list', params);
}

export function packInfo(asset_pack_id: string) {
  return A.get<API.AssetPack>('/asset-pack/my-asset-pack-info', { asset_pack_id });
}
