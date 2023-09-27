import { useMemo } from 'react';

import { isEqual } from '@/utils/utils';
import useRaiseEquity from './useRaiseEquity';

/**
 * 当前用户的角色信息
 * @param data
 * @returns
 */
export default function useRaiseRole(data?: API.Plan | null) {
  const { address, sponsor, servicer: _servicer } = useRaiseEquity(data);
  const raiser = useMemo(() => sponsor?.address ?? data?.raiser, [data, sponsor]); // 主办人
  const servicer = useMemo(() => _servicer?.address ?? data?.service_provider_address, [data, _servicer]); // 服务商
  const isRaiser = useMemo(() => isEqual(address, raiser), [address, raiser]); // 是否主办人
  const isServicer = useMemo(() => isEqual(address, servicer), [address, servicer]); // 是否服务商
  const isSuper = useMemo(() => sponsor?.role_level === 1 || isEqual(address, data?.raiser), [address, data, sponsor]); // 是否第一主办人
  const isSigned = useMemo(() => data?.sp_sign_status === 1, [data?.sp_sign_status]);
  const isOpsPaid = useMemo(() => data?.sp_margin_status === 1, [data?.sp_margin_status]);
  const isRaisePaid = useMemo(() => data?.raise_margin_status === 1, [data?.raise_margin_status]);

  return {
    address,
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
