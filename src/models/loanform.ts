import { useSessionStorageState } from 'ahooks';

import { normalizeKey } from '@/utils/storage';

export default function useLoanForm() {
  const state = useSessionStorageState<API.Base | null | undefined>(normalizeKey('loan.form'));

  return state;
}
