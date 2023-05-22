import { proxy } from '@umijs/max';
import { getInfo } from '@/apis/raise';

export const node = proxy({});
export const raise = proxy({});
export const detail = proxy({});

export const state = proxy({ detail, node, raise });

export const actions = {
  fetchInfo: async (id: string) => {
    const res = await getInfo(id);

    if (res) {
      Object.assign(detail, res);
    }
  },
};
