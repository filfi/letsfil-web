import { useMemo } from 'react';
import { useRequest } from 'ahooks';

import { packInfo } from '@/apis/packs';
import { toNumber } from '@/utils/format';
import { accDiv, accSub, sec2day } from '@/utils/utils';

export default function useRaiseSeals(data?: API.Plan) {
  const service = async () => {
    if (data?.raising_id) {
      return await packInfo(data.raising_id);
    }
  };

  const { data: pack } = useRequest(service, { refreshDeps: [data?.raising_id] });

  const period = useMemo(() => data?.seal_days ?? 0, [data?.seal_days]);
  const power = useMemo(() => +`${pack?.pack_power ?? 0}`, [pack?.pack_power]);
  const actual = useMemo(() => toNumber(data?.actual_amount), [data?.actual_amount]);
  const target = useMemo(() => toNumber(data?.target_amount), [data?.target_amount]);
  const pledge = useMemo(() => toNumber(pack?.pack_initial_pledge), [pack?.pack_initial_pledge]);
  const percent = useMemo(() => (actual > 0 ? accDiv(pledge, actual) : 0), [actual, pledge]);
  const running = useMemo(() => {
    let sec = 0;
    if (data?.begin_seal_time) {
      sec = accSub(Date.now() / 1000, data.begin_seal_time);
    }

    return sec2day(Math.max(sec, 0));
  }, []);
  const remains = useMemo(() => {
    let sec = 0;
    if (pack?.sector_end_expira) {
      sec = accSub(pack.sector_end_expira, Date.now() / 1000);
    }

    return sec2day(Math.max(sec, 0));
  }, [pack?.sector_end_expira]);

  return {
    pack,
    power,
    actual,
    target,
    period,
    pledge,
    percent,
    remains,
    running,
  };
}
