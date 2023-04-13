import { useState } from 'react';
import { useMount } from 'ahooks';

import useAccounts from './useAccounts';
import { toNumber } from '@/utils/format';
import usePlanContract from './usePlanContract';
import type { MaybeRef } from './usePlanContract';

export default function usePlanAmounts(address: MaybeRef<string | undefined>) {
  const { accounts } = useAccounts();
  const plan = usePlanContract(address);

  const [ops, setOps] = useState(0);
  const [raise, setRaise] = useState(0);
  const [invest, setInvest] = useState(0);
  const [total, setTotal] = useState(0);
  const [usable, setUsable] = useState(0);

  const fetchAmounts = async () => {
    if (accounts[0]) {
      const ops = await plan.getOpsFund();
      const raise = await plan.getRaiseFund();
      const invest = await plan.pledgeAmount(accounts[0]);
      const total = await plan.totalRewardOf(accounts[0]);
      const usable = await plan.availableRewardOf(accounts[0]);

      setOps(toNumber(ops));
      setRaise(toNumber(raise));
      setInvest(toNumber(invest));
      setTotal(toNumber(total));
      setUsable(toNumber(usable));
    }
  };

  useMount(fetchAmounts);

  const refresh = async () => await fetchAmounts();

  return { ops, raise, invest, total, usable, refresh };
}
