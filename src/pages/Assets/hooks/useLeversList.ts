import { useUpdateEffect } from 'ahooks';
import { useQuery } from '@tanstack/react-query';

import { withNull } from '@/utils/hackify';
import useAccount from '@/hooks/useAccount';
import useRetrieverContract from '@/hooks/useRetrieverContract';

export default function useLeversList(id?: string) {
  const { address } = useAccount();
  const contract = useRetrieverContract();

  const getLeversList = async () => {
    if (address && id) {
      return await contract.getLeversList(id, address);
    }
  };

  const { data, isError, isLoading, refetch } = useQuery(['getLeversList', address, id], withNull(getLeversList));

  useUpdateEffect(() => {
    refetch();
  }, [id]);

  return {
    data,
    isError,
    isLoading,
    refetch,
  };
}
