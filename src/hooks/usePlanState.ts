import { useEffect, useState } from 'react';

import usePlanContract from './usePlanContract';

export default function usePlanState(address: MaybeRef<string | undefined>) {
  const contract = usePlanContract(address);

  const [nodeState, setNodeState] = useState(0);
  const [planState, setPlanState] = useState(0);

  const fetchStates = async () => {
    const nodeState = await contract.getNodeState();
    const planState = await contract.getRaiseState();

    setNodeState(nodeState ?? 0);
    setPlanState(planState ?? 0);
  };

  useEffect(() => {
    fetchStates();
  }, [address]);

  return { contract, nodeState, planState, setNodeState, setPlanState, refresh: fetchStates };
}
