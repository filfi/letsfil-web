import { useSessionStorageState } from 'ahooks';

import { normalizeKey } from '@/utils/storage';

export default function useAccounts() {
  const state = useSessionStorageState<string[]>(normalizeKey('accounts'), {
    defaultValue: [],
  });

  return state;
}
