import { ethers } from 'ethers';
import { useModel } from '@umijs/max';
import MetaMaskOnboarding from '@metamask/onboarding';
import { useEffect, useMemo, useRef, useState } from 'react';

import * as S from '@/utils/storage';
import Modal from '@/components/Modal';
import useAccountEvents from './useAccountEvents';

export default function useAccounts() {
  const onboarding = useRef(new MetaMaskOnboarding()).current;

  useAccountEvents();
  const [disabled, setDisabled] = useState(false);
  const [buttonText, setBtnText] = useState('点击安装MetaMask');
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
    setState({ connecting: true });

    try {
      const accounts = await window.ethereum?.request({ method: 'eth_requestAccounts' });
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
      Modal.alert({ icon: 'warn', title: '连接失败', content: e.message });
    }
  };

  const getBalance = async (account: string) => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      return await provider.getBalance(account);
    }
  };

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

  const withAccount = <R = any, P extends unknown[] = any>(service: (account: string | undefined, ...args: P) => R) => {
    return async (...args: P) => {
      let account: string | undefined = accounts?.[0];

      if (!account) {
        const list = await requestAccounts();
        account = list?.[0];
      }

      return service(account, ...args);
    };
  };

  const withConnect = <R = any, P extends unknown[] = any>(service: (...args: P) => R) => {
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
    account,
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
