import { camelCase } from 'lodash';
import { useCallback } from 'react';
import { history, useModel } from '@umijs/max';

import { del } from '@/apis/raise';
import { sleep } from '@/utils/utils';
import Dialog from '@/components/Dialog';
import { catchify } from '@/utils/hackify';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import { transformModel } from '@/helpers/app';
import useRaiseContract from './useRaiseContract';

export default function useRaiseActions(data?: API.Plan) {
  const [, setModel] = useModel('stepform');

  const contract = useRaiseContract(data?.raise_address);

  const edit = useCallback(() => {
    if (!data) return;

    const model = Object.keys(data).reduce(
      (d, key) => ({
        ...d,
        [camelCase(key)]: data[key as keyof typeof data],
      }),
      {},
    );

    setModel(transformModel(model));

    history.replace('/create');
  }, []);

  const [closing, close] = useProcessify(
    useCallback(async () => {
      if (!data) return;

      await contract.closeRaisePlan(data.raising_id);

      await sleep(3e3);
    }, [data]),
  );

  const [removing, remove] = useLoadingify(
    useCallback(async () => {
      if (!data) return;

      const [e] = await catchify(del)(data.raising_id);

      if (e) {
        Dialog.alert({
          icon: 'error',
          title: '删除失败',
          content: e.message,
        });
      }

      history.replace('/');
    }, [data]),
  );

  return {
    edit,
    close,
    remove,
    closing,
    removing,
  };
}
