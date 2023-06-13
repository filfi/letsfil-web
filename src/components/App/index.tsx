import VConsole from 'vconsole';
import { WagmiConfig } from 'wagmi';
import { history } from '@umijs/max';
import { Suspense, lazy } from 'react';
import { useBoolean, useMount } from 'ahooks';
import { QueryClientProvider } from '@tanstack/react-query';

import { config, queryClient } from '@/constants/config';

const ReactQueryDevtoolsLazy = lazy(() =>
  import('@tanstack/react-query-devtools/build/lib/index.prod.js').then((d) => ({
    default: d.ReactQueryDevtools,
  })),
);

export default function App({ children }: React.PropsWithChildren) {
  const [showDevtools, { toggle }] = useBoolean(false);

  useMount(() => {
    const params = new URLSearchParams(history.location.search);

    if (params.get('dev')) {
      const vconsole = new VConsole();

      Object.defineProperty(window, 'vconsole', {
        value: vconsole,
        writable: false,
        enumerable: false,
        configurable: false,
      });
    }

    Object.defineProperty(window, 'toggleDevtools', {
      value: toggle,
      writable: false,
      enumerable: false,
      configurable: false,
    });
  });

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>{children}</WagmiConfig>

      {showDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtoolsLazy />
        </Suspense>
      )}
    </QueryClientProvider>
  );
}
