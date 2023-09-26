import { useMemo } from 'react';

import usePackInfo from './usePackInfo';
import { toNumber } from '@/utils/format';
import useMountState from './useMountState';
import useRaiseEquity from './useRaiseEquity';
import { isMountPlan } from '@/helpers/mount';
import { accDiv, accMul } from '@/utils/utils';

export default function useRaiseAssets(data?: API.Plan | null) {
  const { isWorking } = useMountState(data);
  const { data: pack } = usePackInfo(data);
  const { sponsor, servicer, investor, sponsors, servicers, investors, sponsorRate, servicerRate, investorRate } = useRaiseEquity(data);

  const investorPledge = useMemo(() => toNumber(investor?.pledge_amount), [investor?.pledge_amount]);

  const power = useMemo(() => {
    if (isMountPlan(data) && !isWorking) {
      return Number(data?.his_power ?? 0);
    }

    return Number(pack?.total_power);
  }, [data, pack, isWorking]);
  const pledge = useMemo(() => {
    if (isMountPlan(data) && !isWorking) {
      return toNumber(data?.his_initial_pledge);
    }
    return toNumber(pack?.total_pledge_amount);
  }, [data, pack, isWorking]);

  const sponsorPower = useMemo(() => accMul(power, accDiv(sponsorRate, 100)), [power, sponsorRate]);
  const investorPower = useMemo(() => accMul(power, accDiv(investorRate, 100)), [power, investorRate]);
  const servicerPower = useMemo(() => accMul(power, accDiv(servicerRate, 100)), [power, servicerRate]);

  return {
    power,
    pledge,
    sponsor,
    servicer,
    investor,
    sponsors,
    servicers,
    investors,
    sponsorRate,
    servicerRate,
    investorRate,
    sponsorPower,
    investorPower,
    servicerPower,
    investorPledge,
  };
}
