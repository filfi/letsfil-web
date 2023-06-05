import useAccount from './useAccount';

export default function useAuthHandler<R = any, P extends unknown[] = any>(handler: (...args: P) => Promise<R>) {
  const { withConnect } = useAccount();

  return withConnect(handler);
}
