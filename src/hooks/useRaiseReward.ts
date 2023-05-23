import { useEffect, useMemo, useState } from 'react';

import { toNumber } from '@/utils/format';
import useRaiseContract from './useRaiseContract';

export default function useRaiseReward(data?: API.Plan) {
  const { getContract } = useRaiseContract();

  const [fines, setFines] = useState(0);
  const [reward, setReward] = useState(0);

  const contract = useMemo(() => {
    if (data?.raise_address) {
      return getContract(data.raise_address);
    }
  }, [data?.raise_address]);

  const fetchData = async () => {
    if (data?.raising_id) {
      const fines = await contract?.spFine(data.raising_id);
      const total = await contract?.totalRewardAmount(data.raising_id);

      setFines(toNumber(fines));
      setReward(toNumber(total));
    }
  };

  useEffect(() => {
    fetchData();
  }, [contract, data?.raising_id]);

  return {
    contract,
    fines,
    reward,
    refresh: fetchData,
  };
}
