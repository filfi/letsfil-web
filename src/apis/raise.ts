import A from '@/axios';

export function providers() {
  return A.get<void, { list: API.Base[] }>('/service-provier/list');
}

export function plans(params: API.PagingParams & { sort?: string }) {
  return A.get<API.PagingParams, API.PagingRes<API.Base>>('/raising-plan/list', { params });
}

export function raiseList({ address, ...params }: API.PagingParams & { address: string; sort?: string }) {
  return A.get<API.PagingParams, API.PagingRes<API.Base>>('/raising-plan/raiser/list', {
    params: { ...params, raiser_address: address },
  });
}

export function investList({ address, ...params }: API.PagingParams & { address: string; sort?: string }) {
  return A.get<API.PagingParams, API.PagingRes<API.Base>>('/raising-plan/invest/list', {
    params: { ...params, invest_address: address },
  });
}

export function getPlansByAddr(search_address: string) {
  return A.get<
    string,
    API.PagingRes<{
      miner_id: string;
      raising_id: number;
      raise_address: string;
    }>
  >('/raising-plan/address/in/plan/all/list', {
    params: { search_address },
  });
}

export function getInfo(id: number | string) {
  return A.get<void, API.Base>('/raising-plan/info', {
    params: { raising_id: id },
  });
}

export function getGasFee() {
  return A.get<void, API.Base>('/service-provier/get-gas-fee');
}

export function statChainInfo() {
  return A.get<void, API.Base>('/service-provier/get-filscan-stat-chain-info');
}
