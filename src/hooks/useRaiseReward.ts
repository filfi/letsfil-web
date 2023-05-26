import { useEffect, useState } from 'react';

import { toNumber } from '@/utils/format';
import useRaiseContract from './useRaiseContract';

export default function useRaiseReward(data?: API.Plan) {
  const { getContract } = useRaiseContract();

  const [fines, setFines] = useState(0);
  const [reward, setReward] = useState(0);

  const fetchData = async () => {
    if (!data) return;

    const contract = getContract(data.raise_address);

    if (!contract) return;

    const fines = await contract.spFine(data.raising_id);
    const total = await contract.totalRewardAmount(data.raising_id);

    setFines(toNumber(fines));
    setReward(toNumber(total));
  };

  useEffect(() => {
    fetchData();
  }, [data]);

  return {
    fines,
    reward,
    refresh: fetchData,
  };
}
