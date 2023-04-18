import useAccounts from './useAccounts';

export default function useAuthHandler<R = any, P extends unknown[] = any>(handler: (...args: P) => Promise<R>) {
  const { withConnect } = useAccounts();

  return withConnect(handler);
}
