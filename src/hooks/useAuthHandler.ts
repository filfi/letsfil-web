import useAccounts from './useAccounts';

export default function useAuthHandler<R = any, P extends unknown[] = any>(handler: (...args: P) => R) {
  const { withConnect } = useAccounts();

  return withConnect(handler);
}
