import { useMemo } from 'react';

import useAccount from './useAccount';
import usePackInfo from './usePackInfo';
import { toNumber } from '@/utils/format';
import useMountState from './useMountState';
import useRaiseEquity from './useRaiseEquity';
import { accDiv, accMul, isEqual } from '@/utils/utils';

export default function useMountAssets(data?: API.Plan | null) {
  const { address } = useAccount();
  const { isWorking } = useMountState(data);
  const { data: pack } = usePackInfo(data);
  const { sponsors, servicers, investors } = useRaiseEquity(data);

  const sponsor = useMemo(() => sponsors?.find((i) => isEqual(i.address, address)), [address, sponsors]);
  const servicer = useMemo(() => servicers?.find((i) => isEqual(i.address, address)), [address, servicers]);
  const investor = useMemo(() => investors?.find((i) => isEqual(i.address, address)), [address, investors]);

  const sponsorRate = useMemo(() => toNumber(sponsor?.power_proportion, 5), [sponsor]);
  const servicerRate = useMemo(() => toNumber(servicer?.power_proportion, 5), [servicer]);
  const investorRate = useMemo(() => toNumber(investor?.power_proportion, 5), [investor]);

  const investorPledge = useMemo(() => toNumber(investor?.pledge_amount), [investor?.pledge_amount]);

  const power = useMemo(() => +((isWorking ? pack?.total_power : data?.his_power) ?? 0), [data, pack, isWorking]);
  const pledge = useMemo(() => toNumber(isWorking ? pack?.total_pledge_amount : data?.his_initial_pledge), [data, pack, isWorking]);

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
