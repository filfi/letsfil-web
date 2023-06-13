import { useMemo } from 'react';

import { accSub, day2sec, sec2day } from '@/utils/utils';

/**
 * 节点计划封装信息
 * @param data
 * @returns
 */
export default function useRaiseSeals(data?: API.Plan | null, pack?: API.Pack | null) {
  // 承诺封装天数
  const sealsDays = useMemo(() => data?.seal_days ?? 0, [data?.seal_days]);
  // 运行天数
  const runningDays = useMemo(() => {
    let sec = 0;
    if (data?.begin_seal_time) {
      sec = accSub(Date.now() / 1000, data.begin_seal_time);
    }

    return sec2day(Math.max(sec, 0));
  }, [data?.begin_seal_time]);
  // 实际封装天数
  const sealedDays = useMemo(() => {
    let sec = 0;
    if (data?.begin_seal_time) {
      sec = accSub(Date.now() / 1000, data.begin_seal_time);

      if (data.end_seal_time) {
        sec = accSub(data.end_seal_time, data.begin_seal_time);
      }
    }
    return sec2day(Math.max(sec, 0));
  }, [data?.end_seal_time, data?.begin_seal_time]);
  // 延期天数
  const delayedDays = useMemo(() => {
    if (data?.delay_seal_time) {
      return accSub(Date.now() / 1000, data.begin_seal_time, day2sec(data.seal_days));
    }

    return 0;
  }, [data]);
  // 有效期剩余天数
  const remainsDays = useMemo(() => {
    let sec = 0;
    if (pack?.max_expiration_epoch) {
      sec = accSub(pack.max_expiration_epoch, Date.now() / 1000);
    }

    return sec2day(Math.max(sec, 0));
  }, [pack?.max_expiration_epoch]);

  return {
    sealsDays,
    sealedDays,
    delayedDays,
    remainsDays,
    runningDays,
  };
}
