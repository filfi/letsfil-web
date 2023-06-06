import { useMemo } from 'react';
import { useModel } from '@umijs/max';

import * as S from '@/utils/storage';
import Modal from '@/components/Modal';
import { toNumber } from '@/utils/format';

export default function useAccount() {
  const { initialState, setInitialState } = useModel('@@initialState');

  const accounts = useMemo(() => initialState?.accounts ?? [], [initialState]);
  const account = useMemo(() => accounts[0], [accounts]);

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

  const requestAccounts = async (): Promise<string[] | undefined> => {
    if (!window.ethereum) return;

    setState({ connecting: true });

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log(accounts);
      const connected = !!(accounts && accounts[0]);

      setState({
        connected,
        connecting: false,
        accounts: accounts ?? [],
      });

      return accounts;
    } catch (e: any) {
      setState({ connecting: false });

      const message = e.message;

      if (!`${message}`.toLowerCase().includes('user rejected')) {
        Modal.alert({ icon: 'warn', title: '连接失败', content: message });
      }
    }
  };

  const getBalance = async (account: string) => {
    if (account && window.ethereum) {
      try {
        const balance = await window.ethereum.request({ method: 'eth_getBalance', params: [account, 'latest'] });
        return toNumber(balance);
      } catch (e) {
        console.log(e);
      }
    }
  };

  const withAccount = <R = any, P extends unknown[] = any>(service: (account: string, ...args: P) => Promise<R>) => {
    return async (...args: P) => {
      if (account) {
        return service(account, ...args);
      }
    };
  };

  const withConnect = <R = any, P extends unknown[] = any>(service: (...args: P) => Promise<R>) => {
    return withAccount((_, ...args: P) => service(...args));
  };

  const connect = async () => {
    return await requestAccounts();
  };

  const disconnect = () => {
    setState({ accounts: [], connected: false, connecting: false });
  };

  return {
    account,
    accounts,
    getBalance,
    requestAccounts,
    withAccount,
    withConnect,
    connect,
    disconnect,
  };
}
