// import { message } from 'antd';
import { AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';

type Data = Record<string, any>;

export function error(error: AxiosError<Data>) {
  const res = error.response;
  const code = res?.data?.code ?? res?.status;
  // let msg = res?.data?.data?.errorMessage ?? res?.data?.error?.message ?? res?.data?.msg ?? error.message ?? res?.statusText;

  switch (code) {
    case 2000001:
      // 用户不存在 ignore
      break;
    default:
    // message.error(msg);
  }

  return Promise.reject(error);
}

export function request({ headers, ...options }: any) {
  return { ...options, headers: { ...headers } };
}

export function response(res: AxiosResponse<Data>) {
  if (res.status >= 200 && res.status <= 300) {
    if (/stream/.test(res.headers['content-type'])) {
      return res.data;
    }

    if (res.data?.code === 0) {
      return res.data.data;
    }
  }

  const msg = res.data?.error?.message ?? res.data?.message ?? res.data?.msg ?? res.statusText;

  return error(new AxiosError(msg, res.data?.code ?? res.status, res.config, res.request, res));
}
