import { useModel } from '@umijs/max';
import { useMount, useUnmount } from 'ahooks';
import { useEffect, useRef, useState } from 'react';
import MetaMaskOnboarding from '@metamask/onboarding';
import { ethers } from 'ethers';

export default function useAccounts() {
  const onboarding = useRef(new MetaMaskOnboarding()).current;

  const { setInitialState } = useModel('@@initialState');
  const [disabled, setDisabled] = useState(false);
  const [accounts, setAccounts] = useModel('accounts');
  const [buttonText, setBtnText] = useState('点击安装MetaMask');

  const handleAccounts = (accounts: string[]) => {
    setAccounts(accounts);
  };

  const requestAccounts = async (): Promise<string[] | undefined> => {
    setInitialState((d: any) => ({ ...d, connecting: true }));

    const accounts = await window.ethereum?.request({ method: 'eth_requestAccounts' });

    console.log(accounts);

    handleAccounts(accounts ?? []);

    const connected = !!(accounts && accounts[0]);
    setInitialState((d: any) => ({ ...d, connected, connecting: false }));

    return accounts;
  };

  const getBalance = async (account: string) => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      return await provider.getBalance(account);
    }
  };

  const handleConnect = async () => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      return await requestAccounts();
    }

    onboarding.startOnboarding();
  };

  useMount(() => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      window.ethereum?.on('accountsChanged', handleAccounts);

      // requestAccounts();
    }
  });

  useUnmount(() => {
    window.ethereum?.removeListener('accountsChanged', handleAccounts);
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

    setInitialState((d: any) => ({ ...d, connected, connecting: false }));
  }, [accounts]);

  return {
    accounts,
    buttonText,
    disabled,
    getBalance,
    handleConnect,
    requestAccounts,
  };
}
