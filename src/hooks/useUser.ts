import { useRequest } from 'ahooks';

import * as A from '@/apis/user';
import useAccounts from './useAccounts';

export default function useUser() {
  const { account } = useAccounts();

  const service = async () => {
    if (account) {
      return await A.query(account);
    }
  };

  const { data: user, loading, refresh } = useRequest(service, { refreshDeps: [account] });

  const create = async (data: Partial<Omit<API.User, 'address'>>) => {
    if (!account) return;

    await A.create({ ...data, address: account });

    refresh();
  };

  const update = async (data: Partial<Omit<API.User, 'address'>>) => {
    if (!account) return;

    await A.update(account, data);

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
