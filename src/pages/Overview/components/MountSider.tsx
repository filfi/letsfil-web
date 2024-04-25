import { useResponsive } from 'ahooks';

import CardMount from './CardMount';

const MountSider: React.FC = () => {
  const responsive = useResponsive();

  if (responsive.lg) {
    return <CardMount />;
  }

  return null;
};

export default MountSider;
