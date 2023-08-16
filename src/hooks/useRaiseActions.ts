import { camelCase } from 'lodash';
import { history, useModel } from '@umijs/max';

import { del } from '@/apis/raise';
import useContract from './useContract';
import Dialog from '@/components/Dialog';
import { catchify } from '@/utils/hackify';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import { isMountPlan } from '@/helpers/raise';
import { transformModel } from '@/helpers/app';
import type { WriteOptions } from './useContract';

export default function useRaiseActions(data?: API.Plan | null) {
  const [, setModel] = useModel('stepform');

  const contract = useContract(data?.raise_address);

  const edit = async (_data = data) => {
    if (!_data) return;

    const model = Object.keys(_data).reduce(
      (d, key) => ({
        ...d,
        [camelCase(key)]: _data[key as keyof typeof data],
      }),
      {},
    );

    setModel(transformModel(model));

    history.replace(isMountPlan(data) ? '/mount' : '/create');
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
