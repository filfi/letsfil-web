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

export function listLoans(params: API.PagingParams & { invest_address: string }) {
  return A.get<API.PagingRes>('/raising-plan/address/investable/plan', params);
}

export function raiseList({ address, ...params }: API.PagingParams & { address: string; sort?: string }) {
  return A.get<API.PagingRes<API.Plan>>('/raising-plan/raiser/list', { ...params, raiser_address: address });
}

export function investList({ address, ...params }: API.PagingParams & { address: string; sort?: string }) {
  return A.get<{
    total: number;
    list: {
      all_list: API.Plan[];
      invest_list: number[];
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

export function getBanner() {
  return A.get<{ bg_url: string; result: API.Plan }>('/raising-plan/v2/plan/get/banner');
}

export function getGasFee() {
  return A.get<API.Base>('/service-provier/get-gas-fee');
}

export function getIncomeRate(raising_id: string) {
  return A.get<{ ec_income_rate: number }>('/raising-plan/v2/income', { raising_id });
}

export function count(raising_id: string) {
  return A.get<{ investor_count: number }>('/raising-plan/v2/plan/investor/count', { raising_id });
}

export function countSync(raising_id: string) {
  return A.get<{ seal_delay_sync_count: number }>('/raising-plan/v2/raise-sync-count', { raising_id });
}

export function getPrivateList(id: string) {
  return A.get<
    {
      address: string;
      fil_address: string;
      count: number;
      total_amt: string;
    }[]
  >(`/raising-plan/v2/plan/private/list/${id}`);
}

export function getEquity(id: string, params: API.PagingParams) {
  return A.get<API.PagingRes<API.Equity>>(`/raising-plan/v2/plan/get/raise-equity/${id}`, params);
}

export function addEquity(id: string, data: API.Base) {
  return A.post(`/raising-plan/v2/add/raise-equity/${id}`, data);
}

export function updateEquity(id: string, data: API.Base) {
  return A.post(`/raising-plan/v2/modify/raise-equity/${id}`, data);
}

export function getSPInfo(address: string) {
  return A.get<{ list: (API.Provider & API.Base)[] }>('/service-provier/info', { address });
}

export function getSPNodes(address: string) {
  return A.get<{ list: API.Base[] }>('/service-provier/sp-node-list', { address });
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
