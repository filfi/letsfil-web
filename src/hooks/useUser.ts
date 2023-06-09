import { useQuery } from '@tanstack/react-query';

import * as A from '@/apis/user';
import useAccount from './useAccount';

export default function useUser() {
  const { address, withAccount } = useAccount();

  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery(['user', address], withAccount(A.query), {
    staleTime: 60_000,
  });

  const create = async (data: Partial<Omit<API.User, 'address'>>) => {
    if (!address) return;

    await A.create({ ...data, address: address });

    refetch();
  };

  const update = async (data: Partial<Omit<API.User, 'address'>>) => {
    if (!address) return;

    await A.update(address, data);

    refetch();
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
    isLoading,
    create,
    update,
    refetch,
    createOrUpdate,
  };
}
