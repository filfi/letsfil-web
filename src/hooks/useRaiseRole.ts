import { useMemo } from 'react';

import useAccount from './useAccount';
import { isEqual } from '@/utils/utils';

/**
 * 当前用户的角色信息
 * @param data
 * @returns
 */
export default function useRaiseRole(data?: API.Plan | null) {
  const { address } = useAccount();

  const raiser = useMemo(() => data?.raiser ?? '', [data?.raiser]); // 主办人
  const servicer = useMemo(() => data?.service_provider_address ?? '', [data?.service_provider_address]); // 服务商
  const isRaiser = useMemo(() => isEqual(address, raiser), [address, raiser]);
  const isServicer = useMemo(() => isEqual(address, servicer), [address, servicer]);
  const isSigned = useMemo(() => data?.sp_sign_status === 1, [data?.sp_sign_status]);
  const isOpsPaid = useMemo(() => data?.sp_margin_status === 1, [data?.sp_margin_status]);
  const isRaisePaid = useMemo(() => data?.raise_margin_status === 1, [data?.raise_margin_status]);

  return {
    raiser,
    servicer,
    isRaiser,
    isServicer,
    isSigned,
    isOpsPaid,
    isRaisePaid,
  };
}
