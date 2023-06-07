import { proxy } from '@umijs/max';

import { getItem, setItem } from '@/utils/storage';

export const state = proxy({
  processing: getItem('states.processing', false),
});

export const actions = {
  setProcessing: (processing: boolean) => {
    setItem('states.processing', processing);

    state.processing = processing;
  },
};
