import { useMemo } from 'react';
import { useAccount as useWagmi, useConnect, useDisconnect, useBalance } from 'wagmi';

import { useMount } from 'ahooks';
import Dialog from '@/components/Dialog';
import { catchify } from '@/utils/hackify';
import { chains } from '@/constants/config';
import ClientModal from '@/components/ClientModal';
import { connectorAdapter } from '@/core/connectors';

let _autoConnect = false;

function getStorage<V = any>(key: string) {
  const data = localStorage.getItem(key);

  if (data) {
    try {
      return JSON.parse(data) as V;
    } catch (e) {}

    return data as V;
  }

  return null;
}

export default function useAccount() {
  const { address, status } = useWagmi();

  const { disconnectAsync } = useDisconnect();
  const { connectAsync } = useConnect({ chainId: chains[0].id });
  const { data: balance } = useBalance({ address, watch: true });

  const connected = useMemo(() => status === 'connected', [status]);
  const connecting = useMemo(() => status === 'connecting' || status === 'reconnecting', [status]);

  const _connect = async (wallet: string) => {
    const connector = connectorAdapter(wallet);

    if (!connector) return;

    return await connectAsync({ connector });
  };

  useMount(() => {
    if (_autoConnect) return;

    _autoConnect = true;

    const wallet = getStorage<string>('wagmi.wallet');
    const connected = getStorage<boolean>('wagmi.connected');

    if (wallet && connected) {
      _connect(wallet);
    }
  });

  const handleConfirm = async (wallet: string) => {
    const [e] = await catchify(_connect)(wallet);

    if (e?.name === 'ConnectorNotFoundError') {
      Dialog.alert({
        icon: 'error',
        title: '连接失败',
        content: '未检测到' + wallet + '客户端',
      });
    }
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
