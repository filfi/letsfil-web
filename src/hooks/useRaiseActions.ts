import { camelCase } from 'lodash';
import { history, useModel } from '@umijs/max';

import { del } from '@/apis/raise';
import useAccount from './useAccount';
import useContract from './useContract';
import Dialog from '@/components/Dialog';
import { catchify } from '@/utils/hackify';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import { transformModel } from '@/helpers/app';

export default function useRaiseActions(data?: API.Plan) {
  const [, setModel] = useModel('stepform');

  const { withConnect } = useAccount();
  const contract = useContract(data?.raise_address);

  const edit = () => {
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
  };

  const [closing, close] = useProcessify(
    withConnect(async () => {
      if (!data?.raising_id) return;

      return await contract.closeRaisePlan(data.raising_id);
    }),
  );

  const [removing, remove] = useLoadingify(async () => {
    if (!data?.raising_id) return;

    const [e] = await catchify(del)(data.raising_id);

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
