import { useResponsive } from 'ahooks';

import CardMount from './CardMount';

const MountSider: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const responsive = useResponsive();

  if (responsive.lg) {
    return <CardMount data={data} />;
  }

  return null;
};

export default MountSider;
