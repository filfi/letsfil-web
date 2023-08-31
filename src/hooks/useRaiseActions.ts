import { camelCase } from 'lodash';
import { history, useModel } from '@umijs/max';

import useContract from './useContract';
import Dialog from '@/components/Dialog';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import { del, getEquity } from '@/apis/raise';
import { isMountPlan } from '@/helpers/mount';
import { catchify, toastify } from '@/utils/hackify';
import { transformInvestors, transformModel } from '@/helpers/app';
import type { WriteOptions } from './useContract';

export default function useRaiseActions(data?: API.Plan | null) {
  const [, setModel] = useModel('stepform');

  const contract = useContract(data?.raise_address);

  const edit = async (_data = data) => {
    if (!_data) return;

    const model = Object.keys(_data).reduce(
      (d, key) => ({
        ...d,
        [camelCase(key)]: _data[key as keyof typeof _data],
      }),
      {},
    );

    const isMount = isMountPlan(_data);

    if (isMount) {
      const [e, res] = await catchify(toastify(getEquity))(_data.raising_id, { page: 1, page_size: 1000 });

      if (e) throw e;

      Object.assign(model, { investors: transformInvestors(res.list) });
    }

    setModel(transformModel(model));

    history.replace(isMount ? '/mount' : '/create');
  };

  const [closing, close] = useProcessify(async (id = data?.raising_id, opts?: WriteOptions) => {
    if (!id) return;

    return await contract.closeRaisePlan(id, opts);
  });

  const [removing, remove] = useLoadingify(async (id = data?.raising_id) => {
    if (!id) return;

    const [e] = await catchify(del)(id);

    if (e) {
      Dialog.alert({
        icon: 'error',
        title: '删除失败',
        content: e.message,
      });
    }

    history.replace('/');
  });

  return {
    edit,
    close,
    remove,
    closing,
    removing,
  };
}
