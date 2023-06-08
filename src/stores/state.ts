import { proxy } from '@umijs/max';

import { getItem, setItem } from '@/utils/storage';

export const state = proxy({
  processing: getItem('state.processing', false),
});

export const actions = {
  setProcessing: (processing: boolean) => {
    setItem('state.processing', processing);

    state.processing = processing;
  },
};
