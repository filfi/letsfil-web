import MountHeader from './MountHeader';
import RaiseHeader from './RaiseHeader';
import { isMountPlan } from '@/helpers/mount';

import type { AssetsHeaderProps } from './types';

const AssetsHeader: React.FC<AssetsHeaderProps> = ({ data, extra }) => {
  if (isMountPlan(data)) {
    return <MountHeader data={data} extra={extra} />;
  }

  return <RaiseHeader data={data} extra={extra} />;
};

export default AssetsHeader;
