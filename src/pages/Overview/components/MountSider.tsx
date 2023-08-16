import { useResponsive } from 'ahooks';

import CardBack from './CardBack';
import CardMiner from './CardMiner';
import CardRaise from './CardRaise';
import CardAssets from './CardAssets';
import CardStaking from './CardStaking';

const MountSider: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const responsive = useResponsive();

  if (responsive.lg) {
    return (
      <>
        <CardRaise data={data} />

        <CardMiner data={data} />

        <CardStaking data={data} />

        <CardBack data={data} />

        <CardAssets data={data} />

        {/* <CardCalc /> */}
      </>
    );
  }

  return null;
};

export default MountSider;
