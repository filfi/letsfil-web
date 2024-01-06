import { useMemo } from 'react';

import useChainInfo from './useChainInfo';
import { accDiv, accMul } from '@/utils/utils';

/**
 * 年化节点激励率
 * @param data
 * @returns
 */
export default function useIncomeRate(data?: API.Plan | null) {
  const { perFil: _perFil, perPledge: _perPledge } = useChainInfo();

  const ratio = useMemo(() => data?.raiser_coin_share ?? 0, [data?.raiser_coin_share]);
  const perFil = useMemo(() => +`${data?.fil_per_tera_day ?? 0}`, [data?.fil_per_tera_day]);
  const perPledge = useMemo(() => +`${data?.pledge_per_tera_day ?? 0}`, [data?.pledge_per_tera_day]);

  const rate = useMemo(() => {
    let r = 0;
    const fil = perFil || _perFil;
    const pledge = perPledge || _perPledge;

    if (pledge > 0) {
      r = accMul(accDiv(accMul(fil, 360), pledge), accDiv(ratio, 100));
    }

    return Number.isNaN(r) ? 0 : r;
  }, [_perFil, _perPledge, perFil, perPledge, ratio]);

  return {
    rate,
    perFil,
    perPledge,
  };
}
