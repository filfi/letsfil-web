import { useSnapshot } from '@umijs/max';
import type { Dispatch } from 'react';

import { isFn } from '@/utils/utils';
import { state } from '@/stores/state';

export type Updater<V> = (value: V) => V;
export type StateDispatch<V> = Dispatch<V | Updater<V>>;

export default function useProcessing() {
  const { processing } = useSnapshot(state);

  const setProcessing: StateDispatch<boolean> = (value) => {
    if (isFn(value)) {
      state.processing = value(state.processing);
    } else {
      state.processing = value;
    }
  };

  return [processing, setProcessing] as [boolean, StateDispatch<boolean>];
}
