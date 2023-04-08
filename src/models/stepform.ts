import { useSessionStorageState } from 'ahooks';

import { normalizeKey } from '@/utils/storage';

export default function useStepsForm() {
  const state = useSessionStorageState<API.Base | null | undefined>(normalizeKey('steps.form'));

  return state;
}
