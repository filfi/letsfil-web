import { useResponsive } from 'ahooks';

import CardBack from './CardBack';
import CardRaise from './CardRaise';
import CardAssets from './CardAssets';
import CardStaking from './CardStaking';

const ContSider: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const responsive = useResponsive();

  if (responsive.lg) {
    return (
      <>
        <CardRaise data={data} />

        <CardStaking data={data} />

        <CardBack data={data} />

        <CardAssets data={data} />

        {/* <CardCalc /> */}
      </>
    );
  }

  return null;
};

export default ContSider;
