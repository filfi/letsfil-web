import { useModel } from '@umijs/max';
import { useMount, useUnmount } from 'ahooks';

import * as S from '@/utils/storage';

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

  const onAccounts = (accounts: string[]) => {
    if (initialState?.connected) {
      setState({ accounts });
    }
  };

  const onChainChanged = (chainId: string) => {
    if (initialState?.connected) {
      setState({ chainId });
    }
  };

  useMount(() => {
    window.ethereum?.on('accountsChanged', onAccounts);
    window.ethereum?.on('chainChanged', onChainChanged);
  });

  useUnmount(() => {
    window.ethereum?.removeListener('accountsChanged', onAccounts);
    window.ethereum?.removeListener('chainChanged', onChainChanged);
  });
}
