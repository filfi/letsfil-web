import { useMemo } from 'react';

import { toNumber } from '@/utils/format';
import { accDiv, accSub, sec2day } from '@/utils/utils';

/**
 * 节点计划封装信息
 * @param data
 * @returns
 */
export default function useRaiseSeals(data?: API.Plan, pack?: API.Pack) {
  const period = useMemo(() => data?.seal_days ?? 0, [data?.seal_days]);
  const power = useMemo(() => +`${pack?.total_power ?? 0}`, [pack?.total_power]);
  const sector = useMemo(() => +`${pack?.total_sector ?? 0}`, [pack?.total_sector]);
  const actual = useMemo(() => toNumber(data?.actual_amount), [data?.actual_amount]);
  const target = useMemo(() => toNumber(data?.target_amount), [data?.target_amount]);
  const pledge = useMemo(() => toNumber(pack?.total_pledge_amount), [pack?.total_pledge_amount]);
  const progress = useMemo(() => (actual > 0 ? accDiv(pledge, actual) : 0), [actual, pledge]);
  // 运行天数
  const running = useMemo(() => {
    let sec = 0;
    if (data?.begin_seal_time) {
      sec = accSub(Date.now() / 1000, data.begin_seal_time);
    }

    return sec2day(Math.max(sec, 0));
  }, [data?.begin_seal_time]);
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
    if (pack?.max_expiration_epoch) {
      sec = accSub(pack.max_expiration_epoch, Date.now() / 1000);
    }

    return sec2day(Math.max(sec, 0));
  }, [pack?.max_expiration_epoch]);

  return {
    power,
    actual,
    sector,
    target,
    period,
    pledge,
    remains,
    running,
    progress,
    sealdays,
  };
}
