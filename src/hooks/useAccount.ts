import { useMemo } from 'react';
import { useAccount as useWagmi, useConnect, useDisconnect } from 'wagmi';

import Dialog from '@/components/Dialog';
import { catchify } from '@/utils/hackify';
import { chains } from '@/constants/config';
import ClientModal from '@/components/ClientModal';
import { connectorAdapter } from '@/core/connectors';

export type ConnectOptions = {
  id: string;
  slient?: boolean;
};

export default function useAccount() {
  const { address, status } = useWagmi();

  const { disconnectAsync } = useDisconnect();
  const { connectAsync } = useConnect({ chainId: chains[0].id });

  const connected = useMemo(() => status === 'connected', [status]);
  const connecting = useMemo(() => status === 'connecting' || status === 'reconnecting', [status]);

  const _connect = async ({ id }: ConnectOptions) => {
    const connector = connectorAdapter(id);

    if (!connector) return;

    return await connectAsync({ connector });
  };

  const handleConnect = async (opts: ConnectOptions) => {
    const [e] = await catchify(_connect)(opts);

    if (!opts.slient && e?.name === 'ConnectorNotFoundError') {
      Dialog.alert({
        icon: 'error',
        title: '連線失敗',
        content: '未檢測到' + opts.id + '客戶端',
      });
    }
  };

  const connect = (opts?: ConnectOptions) => {
    if (!opts?.slient) {
      const hide = ClientModal.show({
        showFooter: false,
        onChange: (id) => {
          hide();

          handleConnect({ id });
        },
      });
      return;
    }

    handleConnect(opts);
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
    connected,
    connecting,
    withAccount,
    withConnect,
    connect,
    disconnect,
  };
}
