import * as A from '@/axios';

export function query(addr: string) {
  return A.get<API.User>(`/user/v2/query/${addr}`);
}

export function create(data: Partial<API.User>) {
  return A.post<void>('/user/v2/create', data);
}

export function update(addr: string, data: Partial<Omit<API.User, 'address'>>) {
  return A.post<void>(`/user/v2/update/${addr}`, data);
}
