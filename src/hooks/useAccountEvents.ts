import { useModel } from '@umijs/max';
import { useLockFn, useMemoizedFn, useMount, useUnmount } from 'ahooks';

import * as S from '@/utils/storage';
import { sleep } from '@/utils/utils';

export default function useAccountEvents() {
  const { initialState, setInitialState } = useModel('@@initialState');

  const setState = (state: Partial<InitState>) => {
    setInitialState((d) => {
      const _state = {
        ...d,
        ...state,
      };

      S.setInitState(_state as any);

      return _state as any;
    });
  };

  const reload = useLockFn(async () => {
    await sleep(60 / 1000);
    location.reload();
  });

  const onAccounts = useMemoizedFn((accounts: string[]) => {
    if (initialState?.connected) {
      setState({ accounts });
      reload();
    }
  });

  const onChainChanged = useMemoizedFn((chainId: string) => {
    if (initialState?.connected) {
      setState({ chainId });
      reload();
    }
  });

  useMount(() => {
    window.ethereum?.on('accountsChanged', onAccounts);
    window.ethereum?.on('chainChanged', onChainChanged);
  });

  useUnmount(() => {
    window.ethereum?.removeListener('accountsChanged', onAccounts);
    window.ethereum?.removeListener('chainChanged', onChainChanged);
  });
}
