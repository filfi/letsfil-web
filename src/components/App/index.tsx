import VConsole from 'vconsole';
import { useMount } from 'ahooks';
import { WagmiConfig } from 'wagmi';
import { history } from '@umijs/max';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { config, queryClient } from '@/constants/config';

const isDev = process.env.NODE_ENV === 'development';

export default function App({ children }: React.PropsWithChildren) {
  useMount(() => {
    const params = new URLSearchParams(history.location.search);

    if (params.get('dev')) {
      const vconsole = new VConsole();

      Object.defineProperty(window, 'vconsole', {
        value: vconsole,
        writable: false,
        enumerable: true,
        configurable: false,
      });
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>{children}</WagmiConfig>

      {isDev && <ReactQueryDevtools panelPosition="right" position="bottom-left" />}
    </QueryClientProvider>
  );
}
