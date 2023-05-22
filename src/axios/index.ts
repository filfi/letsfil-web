import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

import { API_URL } from '@/constants';
import { error, request, response } from './interceptors';

export const base = axios.create({
  baseURL: API_URL,
});

base.interceptors.request.use(request, error);
base.interceptors.response.use(response, error);

export default base;

export function get<R = any>(url: string, params?: any, config?: AxiosRequestConfig) {
  return base.get<typeof params, R>(url, { params, ...config });
}

export function post<R = any>(url: string, data?: any, config?: AxiosRequestConfig) {
  return base.post<typeof data, R>(url, data, config);
}
