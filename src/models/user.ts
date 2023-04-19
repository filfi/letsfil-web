import { useSessionStorageState } from 'ahooks';

import { normalizeKey } from '@/utils/storage';
import { useMemo } from 'react';

export default function useUser() {
  const [user, setUser] = useSessionStorageState<User | undefined>(normalizeKey('user'));

  const isRaiser = useMemo(() => user?.role === 'raiser', [user?.role]);

  return { user, isRaiser, setUser };
}
