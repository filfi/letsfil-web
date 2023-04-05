import A from '@/axios';

export function providers() {
  return A.get<void, { list: API.Base[] }>('/service-provier/list');
}

export function plans(params: API.PagingParams) {
  return A.get<API.PagingParams, API.PagingRes<API.Base>>(
    '/raising-plan/list',
    { params },
  );
}

export function raiseList({
  address,
  ...params
}: API.PagingParams & { address: string }) {
  return A.get<API.PagingParams, API.PagingRes<API.Base>>(
    '/raising-plan/raiser/list',
    {
      params: { ...params, raiser_address: address },
    },
  );
}

export function investList({
  address,
  ...params
}: API.PagingParams & { address: string }) {
  return A.get<API.PagingParams, API.PagingRes<API.Base>>(
    '/raising-plan/invest/list',
    {
      params: { ...params, invest_address: address },
    },
  );
}

export function getInfo(id: number | string) {
  return A.get<void, API.Base>('/raising-plan/info', {
    params: { raising_id: id },
  });
}
