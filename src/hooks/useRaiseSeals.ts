import { useMemo } from 'react';
import { useRequest } from 'ahooks';

import { packInfo } from '@/apis/packs';
import { toNumber } from '@/utils/format';
import { accDiv, accSub, sec2day } from '@/utils/utils';

/**
 * 募集计划封装信息
 * @param data
 * @returns
 */
export default function useRaiseSeals(data?: API.Plan) {
  const service = async () => {
    if (data?.raising_id) {
      return await packInfo(data.raising_id);
    }
  };

  const { data: pack, loading, refresh } = useRequest(service, { refreshDeps: [data?.raising_id] });

  const period = useMemo(() => data?.seal_days ?? 0, [data?.seal_days]);
  const power = useMemo(() => +`${pack?.pack_power ?? 0}`, [pack?.pack_power]);
  const actual = useMemo(() => toNumber(data?.actual_amount), [data?.actual_amount]);
  const target = useMemo(() => toNumber(data?.target_amount), [data?.target_amount]);
  const pledge = useMemo(() => toNumber(pack?.pack_initial_pledge), [pack?.pack_initial_pledge]);
  const percent = useMemo(() => (actual > 0 ? accDiv(pledge, actual) : 0), [actual, pledge]);
  // 运行天数
  const running = useMemo(() => {
    let sec = 0;
    if (data?.begin_seal_time) {
      sec = accSub(Date.now() / 1000, data.begin_seal_time);
    }

    return sec2day(Math.max(sec, 0));
  }, []);
  // 封装天数
  const sealdays = useMemo(() => {
    let sec = 0;
    if (data?.begin_seal_time) {
      sec = accSub(Date.now() / 1000, data.begin_seal_time);

      if (data.end_seal_time) {
        sec = accSub(data.end_seal_time, data.begin_seal_time);
      }
    }
    return sec2day(Math.max(sec, 0));
  }, [data?.end_seal_time, data?.begin_seal_time]);
  // 有效期剩余天数
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
    sealdays,
    loading,
    refresh,
  };
}
