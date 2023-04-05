import { useRef } from 'react';
import { ethers } from 'ethers';
import { /* useIntl, */ useModel } from '@umijs/max';
import MetaMaskOnboarding from '@metamask/onboarding';

// import Modal from '@/components/Modal';

const getProvider = () => {
  if (MetaMaskOnboarding.isMetaMaskInstalled()) {
    return new ethers.providers.Web3Provider(window.ethereum!);
  }

  return null;
};

export default function useWallet() {
  const onboarding = useRef(new MetaMaskOnboarding()).current;

  const [wallet, setWallet] = useModel('wallet');
  const { setInitialState } = useModel('@@initialState');

  // const { formatMessage } = useIntl();

  const fetchWallet = async () => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      const provider = getProvider()!;
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const balance = await signer.getBalance();

      setWallet({ address, balance });
      setInitialState((state) => ({ ...state!, connected: true }));
    }
  };

  const connect = async () => {
    if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
      // Modal.alert({ icon: 'warn', content: formatMessage({ id: 'notify.warn.matemask' }) });
      onboarding.startOnboarding();
      return;
    }

    const provider = getProvider()!;

    setInitialState((state) => ({
      ...state!,
      connected: false,
      connecting: true,
    }));

    onboarding.stopOnboarding();

    await provider.send('eth_requestAccounts', []);

    await fetchWallet();

    setInitialState((state) => ({
      ...state!,
      connected: true,
      connecting: false,
    }));
  };

  return { wallet, connect, fetchWallet, setWallet };
}
