import { useRef, useState } from 'react';
import MetaMaskOnboarding from '@metamask/onboarding';
import { useMount, useUnmount, useUpdateEffect } from 'ahooks';

export default function useAccounts() {
  const onboarding = useRef(new MetaMaskOnboarding()).current;

  const [disabled, setDisabled] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [buttonText, setBtnText] = useState('点击安装MetaMask');

  const handleAccounts = (accounts: any[]) => {
    setAccounts(accounts);
  };

  const requestAccounts = () => {
    window.ethereum
      ?.request({ method: 'eth_requestAccounts' })
      .then(handleAccounts);
  };

  const handleConnect = () => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      requestAccounts();
    } else {
      onboarding.startOnboarding();
    }
  };

  useMount(() => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      window.ethereum?.on('accountsChanged', handleAccounts);

      requestAccounts();
    }
  });

  useUnmount(() => {
    window.ethereum?.removeListener('accountsChanged', handleAccounts);
  });

  useUpdateEffect(() => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      if (accounts.length > 0) {
        setBtnText('已连接');
        setDisabled(true);
        onboarding.stopOnboarding();
      } else {
        setBtnText('连接钱包');
        setDisabled(false);
      }
    }
  }, [accounts]);

  return {
    accounts,
    buttonText,
    disabled,
    handleConnect,
    requestAccounts,
  };
}
