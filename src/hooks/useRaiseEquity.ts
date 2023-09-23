import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import useAccount from './useAccount';
import { getEquity } from '@/apis/raise';
import { isEqual } from '@/utils/utils';
import { toNumber } from '@/utils/format';

const isSponsor = <D extends { role: number }>(data: D) => data.role === 1;
const isInvestor = <D extends { role: number }>(data: D) => data.role === 2;
const isServicers = <D extends { role: number }>(data: D) => data.role === 3;

export default function useRaiseEquity(plan?: API.Plan | null) {
  const queryFn = async () => {
    if (plan?.raising_id) {
      const res = await getEquity(plan.raising_id, { page_size: 1_000 });
      return res.list;
    }
  };

  const { address } = useAccount();
  const { data, isError, isLoading, refetch } = useQuery(['getRaiseEquity', plan?.raising_id], queryFn);

  const sponsors = useMemo(() => data?.filter(isSponsor), [data]);
  const investors = useMemo(() => data?.filter(isInvestor), [data]);
  const servicers = useMemo(() => data?.filter(isServicers), [data]);

  const sponsor = useMemo(() => sponsors?.find((i) => isEqual(i.address, address)), [address, sponsors]);
  const servicer = useMemo(() => servicers?.find((i) => isEqual(i.address, address)), [address, servicers]);
  const investor = useMemo(() => investors?.find((i) => isEqual(i.address, address)), [address, investors]);

  const sponsorRate = useMemo(() => toNumber(sponsor?.power_proportion, 5), [sponsor]);
  const servicerRate = useMemo(() => toNumber(servicer?.power_proportion, 5), [servicer]);
  const investorRate = useMemo(() => toNumber(investor?.power_proportion, 5), [investor]);

  return {
    data,
    sponsor,
    servicer,
    investor,
    sponsors,
    investors,
    servicers,
    sponsorRate,
    servicerRate,
    investorRate,
    isError,
    isLoading,
    refetch,
  };
}
