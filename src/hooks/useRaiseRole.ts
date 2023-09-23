import { useMemo } from 'react';

import useRaiseEquity from './useRaiseEquity';

/**
 * 当前用户的角色信息
 * @param data
 * @returns
 */
export default function useRaiseRole(data?: API.Plan | null) {
  const { sponsor, servicer: _servicer } = useRaiseEquity(data);
  const raiser = useMemo(() => sponsor?.address, [sponsor]); // 主办人
  const servicer = useMemo(() => _servicer?.address, [_servicer]); // 服务商
  const isRaiser = useMemo(() => Boolean(sponsor), [sponsor]);
  const isServicer = useMemo(() => Boolean(_servicer), [_servicer]);
  const isSuper = useMemo(() => sponsor?.role_level === 1, [sponsor]);
  const isSigned = useMemo(() => data?.sp_sign_status === 1, [data?.sp_sign_status]);
  const isOpsPaid = useMemo(() => data?.sp_margin_status === 1, [data?.sp_margin_status]);
  const isRaisePaid = useMemo(() => data?.raise_margin_status === 1, [data?.raise_margin_status]);

  return {
    raiser,
    servicer,
    isSuper,
    isRaiser,
    isServicer,
    isSigned,
    isOpsPaid,
    isRaisePaid,
  };
}
