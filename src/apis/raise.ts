import * as A from '@/axios';

export function providers() {
  return A.get<{ list: API.Provider[] }>('/service-provier/list');
}

export function plans(params: API.PagingParams & { sort?: string }) {
  return A.get<API.PagingRes<API.Plan>>('/raising-plan/list', params);
}

export function add(data: API.Base) {
  return A.post<void>('/raising-plan/v2/add/plan', data);
}

export function del(id: string) {
  return A.post<void>(`/raising-plan/v2/drop/plan/${id}`);
}

export function update(id: string, data: API.Base) {
  return A.post<void>(`/raising-plan/v2/modify/plan/${id}`, data);
}

export function list(params: API.PagingParams & { status: string }) {
  return A.get<API.PagingRes<API.Plan>>('/raising-plan/list', params);
}

export function raiseList({ address, ...params }: API.PagingParams & { address: string; sort?: string }) {
  return A.get<API.PagingRes<API.Plan>>('/raising-plan/raiser/list', { ...params, raiser_address: address });
}

export function investList({ address, ...params }: API.PagingParams & { address: string; sort?: string }) {
  return A.get<{
    total: number;
    list: {
      all_list: API.Plan[];
      invest_list: API.Plan[];
    };
  }>('/raising-plan/invest/list', { ...params, invest_address: address });
}

export function getPlansByAddr(search_address: string) {
  return A.get<
    API.PagingRes<{
      miner_id: string;
      raising_id: number;
      raise_address: string;
    }>
  >('/raising-plan/address/in/plan/all/list', { search_address });
}

export function getInfo(id: number | string) {
  return A.get<API.Plan>('/raising-plan/info', { raising_id: id });
}

export function getEvents(params: API.PagingParams & { raising_id: number | string }) {
  return A.get<API.PagingRes<API.Event>>('/raising-plan/v2/event/list', params);
}

export function getGasFee() {
  return A.get<API.Base>('/service-provier/get-gas-fee');
}

export function statChainInfo() {
  return A.get<API.Base>('/service-provier/get-filscan-stat-chain-info');
}

export function statAsset(id: number | string) {
  return A.get<API.Base>('/raising-plan/asset/report', { raising_id: id });
}

export function minerInfo(miner_id: string) {
  return A.get<API.MinerAsset>('/miner/miner-info', { miner_id });
}

export function presign(file_name: string) {
  return A.post<{
    file_name: string;
    header: Record<string, string[]>;
    uri: string;
    access_url: string;
  }>('/service-provier/v2/presign-upload', { file_name });
}
