import { useMemo } from 'react';

import usePackInfo from './usePackInfo';
import { toNumber } from '@/utils/format';
import useRaiseRate from './useRaiseRate';
import useMountState from './useMountState';
import useRaiseEquity from './useRaiseEquity';
import { accDiv, accMul } from '@/utils/utils';

export default function useMountAssets(data?: API.Plan | null) {
  const { isWorking } = useMountState(data);
  const { data: pack } = usePackInfo(data);
  const { superRate, servicerRate } = useRaiseRate(data);
  const { sponsor, servicer, investor, sponsors, servicers, investors, sponsorRate, investorRate } = useRaiseEquity(data);

  const investorPledge = useMemo(() => toNumber(investor?.pledge_amount), [investor?.pledge_amount]);

  const power = useMemo(() => +((isWorking ? pack?.total_power : data?.his_power) ?? 0), [data, pack, isWorking]);
  const pledge = useMemo(() => toNumber(isWorking ? pack?.total_pledge_amount : data?.his_initial_pledge), [data, pack, isWorking]);

  const superPower = useMemo(() => accMul(power, accDiv(superRate, 100)), [power, superRate]);
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
    superRate,
    sponsorRate,
    servicerRate,
    investorRate,
    superPower,
    sponsorPower,
    investorPower,
    servicerPower,
    investorPledge,
  };
}
