import { message } from 'antd';
import { AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';

type Data = Record<string, any>;

export function error(error: AxiosError<Data>) {
  const res = error.response;
  let msg = res?.data?.data?.errorMessage ?? res?.data?.message ?? error.message ?? res?.statusText;

  message.error(msg);

  return Promise.reject(error);
}

export function request({ headers, ...options }: any) {
  return { ...options, headers: { ...headers }, };
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

  return error(
    new AxiosError(
      res.data?.message ?? res.statusText,
      res.data?.code ?? res.status,
      res.config,
      res.request,
      res,
    ),
  );
}
