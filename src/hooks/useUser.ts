import { useRequest } from 'ahooks';

import * as A from '@/apis/user';
import useAccount from './useAccount';

export default function useUser() {
  const { address, withAccount } = useAccount();

  const { data: user, loading, refresh } = useRequest(withAccount(A.query), { refreshDeps: [address] });

  const create = async (data: Partial<Omit<API.User, 'address'>>) => {
    if (!address) return;

    await A.create({ ...data, address: address });

    refresh();
  };

  const update = async (data: Partial<Omit<API.User, 'address'>>) => {
    if (!address) return;

    await A.update(address, data);

    refresh();
  };

  const createOrUpdate = async (data: Partial<Omit<API.User, 'address'>>) => {
    if (user) {
      await update(data);
    } else {
      await create(data);
    }
  };

  return {
    user,
    loading,
    create,
    update,
    refresh,
    createOrUpdate,
  };
}
