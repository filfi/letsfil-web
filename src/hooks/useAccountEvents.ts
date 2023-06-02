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
    setState({ accounts });

    if (initialState?.connected) {
      reload();
    }
  });

  const onChainChanged = useMemoizedFn((chainId: string) => {
    setState({ chainId });

    if (initialState?.connected) {
      reload();
    }
  });

  const onMessage = (e: API.Base) => {
    console.log(e);
  };

  const onError = (e: any) => {
    console.log(e);
  };

  useMount(() => {
    window.ethereum?.on('accountsChanged', onAccounts);
    window.ethereum?.on('chainChanged', onChainChanged);
    window.ethereum?.on('message', onMessage);
    window.ethereum?.on('error', onError);
  });

  useUnmount(() => {
    window.ethereum?.removeListener('accountsChanged', onAccounts);
    window.ethereum?.removeListener('chainChanged', onChainChanged);
    window.ethereum?.removeListener('message', onMessage);
    window.ethereum?.removeListener('error', onError);
  });
}
