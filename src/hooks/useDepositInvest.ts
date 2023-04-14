import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

import useAccounts from './useAccounts';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useEmittHandler from './useEmitHandler';
import usePlanContract from './usePlanContract';
import type { MaybeRef } from './usePlanContract';

export default function useInvestAmount(address: MaybeRef<string | undefined>) {
  const { accounts } = useAccounts();
  const contract = usePlanContract(address);

  const [amount, setAmount] = useState(0);
  const [totalPledge, setTotalPledge] = useState(0);

  const fetchAmount = async () => {
    if (accounts[0]) {
      const raise = await contract.pledgeAmount(accounts[0]);

      setAmount(toNumber(raise));
    }

    const total = await contract.pledgeTotalAmount();

    setTotalPledge(toNumber(total));
  };

  const { loading, run: withdraw } = useLoadingify(async () => {
    await contract.unStaking(ethers.utils.parseEther(`${amount}`));
  });

  useEffect(() => {
    fetchAmount();
  }, [address, accounts]);

  useEmittHandler({
    [EventType.onUnstaking]: fetchAmount,
    [EventType.onWithdrawOPSFund]: fetchAmount,
  });

  return { contract, amount, totalPledge, loading, withdraw };
}
