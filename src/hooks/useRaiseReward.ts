import { useEffect, useState } from 'react';

import { toNumber } from '@/utils/format';
import useRaiseContract from './useRaiseContract';

export default function useRaiseReward(data?: API.Plan) {
  const [fines, setFines] = useState(0);
  const [reward, setReward] = useState(0);

  const contract = useRaiseContract(data?.raise_address);

  const fetchData = async () => {
    if (!data) return;

    const total = await contract.getTotalReward(data.raising_id);
    const fines = await contract.getServicerFines(data.raising_id);

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
