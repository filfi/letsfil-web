import { useMemo } from 'react';
import { useAccount as useWagmi, useConnect, useDisconnect, Connector } from 'wagmi';

// import Modal from '@/components/Modal';
import { toNumber } from '@/utils/format';
import { catchify } from '@/utils/hackify';
import ClientModal from '@/components/ClientModal';
import { FoxWalletConnector, MetaMaskConnector, TokenPocketConnector } from '@/core/connectors';

export default function useAccount() {
  const { address, status } = useWagmi();

  const connected = useMemo(() => status === 'connected', [status]);
  const connecting = useMemo(() => status === 'connecting' || status === 'reconnecting', [status]);

  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();

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

  const withAccount = <R = any, P extends unknown[] = any>(service: (address: string, ...args: P) => Promise<R>) => {
    return async (...args: P) => {
      if (address) {
        return service(address, ...args);
      }
    };
  };

  const withConnect = <R = any, P extends unknown[] = any>(service: (...args: P) => Promise<R>) => {
    return withAccount((_, ...args: P) => service(...args));
  };

  const handleConfirm = async (id: string) => {
    let connector: Connector | undefined;

    switch (id) {
      case 'foxWallet':
        connector = new FoxWalletConnector();
        break;
      case 'tokenPocket':
        connector = new TokenPocketConnector();
        break;
      case 'metaMask':
        connector = new MetaMaskConnector();
        break;
    }

    if (!connector) return;

    const [e, res] = await catchify(connectAsync)({ connector });

    if (e?.name === 'ConnectorNotFoundError') {
      console.log(e.message);
    }

    console.log(res);
  };

  const connect = () => {
    ClientModal.show({
      loading: connecting,
      onConfirm: handleConfirm,
    });
  };

  const disconnect = async () => {
    await disconnectAsync();
  };

  return {
    account: address,
    connected,
    connecting,
    getBalance,
    withAccount,
    withConnect,
    connect,
    disconnect,
  };
}
