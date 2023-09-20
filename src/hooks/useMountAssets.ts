import { useMemo } from 'react';

import useAccount from './useAccount';
import usePackInfo from './usePackInfo';
import { toNumber } from '@/utils/format';
import useRaiseRate from './useRaiseRate';
import useMountState from './useMountState';
import useRaiseEquity from './useRaiseEquity';
import { accDiv, accMul, isEqual } from '@/utils/utils';

export default function useMountAssets(data?: API.Plan | null) {
  const { address } = useAccount();
  const { isWorking } = useMountState(data);
  const { data: pack } = usePackInfo(data);
  const { investors } = useRaiseEquity(data);
  const { servicerRate, raiserRate } = useRaiseRate(data);

  const power = useMemo(() => +((isWorking ? pack?.total_power : data?.his_power) ?? 0), [data, pack, isWorking]);
  const pledge = useMemo(() => toNumber(isWorking ? pack?.total_pledge_amount : data?.his_initial_pledge), [data, pack, isWorking]);
  const investor = useMemo(() => investors?.find((i) => isEqual(i.address, address)), [address, investors]);
  const investorPledge = useMemo(() => toNumber(investor?.pledge_amount), [investor?.pledge_amount]);
  const investorRate = useMemo(() => toNumber(investor?.power_proportion, 5), [investor?.power_proportion]);

  const raiserPower = useMemo(() => accMul(power, accDiv(raiserRate, 100)), [power, raiserRate]);
  const investorPower = useMemo(() => accMul(power, accDiv(investorRate, 100)), [power, investorRate]);
  const servicerPower = useMemo(() => accMul(power, accDiv(servicerRate, 100)), [power, servicerRate]);

  return {
    power,
    pledge,
    investor,
    investors,
    raiserRate,
    investorRate,
    servicerRate,
    raiserPower,
    investorPower,
    servicerPower,
    investorPledge,
  };
}
