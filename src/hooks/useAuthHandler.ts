import useAccounts from './useAccounts';

export default function useAuthHandler<R = any, P extends unknown[] = any>(handler: (...args: P) => Promise<R> | R) {
  const { accounts, requestAccounts } = useAccounts();

  return async (...args: P): Promise<Awaited<R> | undefined> => {
    if (accounts[0]) {
      return await handler(...args);
    }

    await requestAccounts();
  };
}
