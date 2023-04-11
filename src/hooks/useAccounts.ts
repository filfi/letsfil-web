import { ethers } from 'ethers';
import { useModel } from '@umijs/max';
import { useMount, useUnmount } from 'ahooks';
import MetaMaskOnboarding from '@metamask/onboarding';
import { useEffect, useMemo, useRef, useState } from 'react';

import * as S from '@/utils/storage';

export default function useAccounts() {
  const onboarding = useRef(new MetaMaskOnboarding()).current;

  const [disabled, setDisabled] = useState(false);
  const [buttonText, setBtnText] = useState('点击安装MetaMask');
  const { initialState, setInitialState } = useModel('@@initialState');

  const accounts = useMemo(() => initialState?.accounts ?? [], [initialState]);

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
    setState({ accounts });
  };

  const onChainChanged = (chainId: string) => {
    setState({ chainId });
  };

  const requestAccounts = async (): Promise<string[] | undefined> => {
    setState({ connecting: true });

    const accounts = await window.ethereum?.request({ method: 'eth_requestAccounts' });

    console.log(accounts);
    const connected = !!(accounts && accounts[0]);

    setState({
      connected,
      connecting: false,
      accounts: accounts ?? [],
    });

    return accounts;
  };

  const getBalance = async (account: string) => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      return await provider.getBalance(account);
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

  useEffect(() => {
    let connected = false;
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      if (accounts.length > 0) {
        setBtnText('已连接');
        setDisabled(true);
        connected = true;
        onboarding.stopOnboarding();
      } else {
        setBtnText('连接钱包');
        setDisabled(false);
      }
    }

    setState({ connected, connecting: false });
  }, [accounts]);

  const withAccount = <R = any, P extends unknown[] = any>(service: (account: string | undefined, ...args: P) => Promise<R>) => {
    return async (...args: P) => {
      let account: string | undefined = accounts?.[0];

      if (!account) {
        const list = await requestAccounts();
        account = list?.[0];
      }

      return service(account, ...args);
    };
  };

  const withConnect = <R = any, P extends unknown[] = any>(service: (...args: P) => Promise<R>) => {
    return withAccount((_, ...args: P) => service(...args));
  };

  const handleConnect = async () => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      return await requestAccounts();
    }

    onboarding.startOnboarding();
  };

  const handleDisconnect = () => {
    setState({ accounts: [], connected: false, connecting: false });
  };

  return {
    accounts,
    buttonText,
    disabled,
    getBalance,
    withAccount,
    withConnect,
    handleConnect,
    requestAccounts,
    handleDisconnect,
  };
}
