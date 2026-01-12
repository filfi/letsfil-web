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

  // const status: string = 'connected'
  // const address = '0x6c7434feb871d105b1ddf613d941c499ee3b36b0'
  // const address = '0xC5843790Ab007Fc0B0F7C057764925a5FB644fbB'
  // const address = '0xA9aC84B0e87436a4b715A04Db6d8b56e9c7D8a9A'
  // const address = '0xc166A292cb01514A267f482d771f8b48f54C664C'

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
        title: '连接失败',
        content: '未检测到' + opts.id + '客户端',
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
