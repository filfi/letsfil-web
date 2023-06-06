import { useMemo } from 'react';
import { useAccount as useWagmi, useConnect, useDisconnect, Connector, useBalance } from 'wagmi';

import { catchify } from '@/utils/hackify';
import ClientModal from '@/components/ClientModal';
import { FoxWalletConnector, MetaMaskConnector, TokenPocketConnector } from '@/core/connectors';

export default function useAccount() {
  const { address, status } = useWagmi();

  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { data: balance } = useBalance({ address });

  const connected = useMemo(() => status === 'connected', [status]);
  const connecting = useMemo(() => status === 'connecting' || status === 'reconnecting', [status]);

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

  const withAccount = <R = any, P extends unknown[] = any>(service: (address: string, ...args: P) => Promise<R>) => {
    return async (...args: P) => {
      if (address) {
        return service(address, ...args);
      }
    };
  };

  const withConnect = <R = any, P extends unknown[] = any>(service: (...args: P) => Promise<R>) => {
    return async (...args: P) => {
      if (!address) {
        connect();
        return;
      }

      return await service(...args);
    };
  };

  return {
    address,
    balance,
    connected,
    connecting,
    withAccount,
    withConnect,
    connect,
    disconnect,
  };
}
