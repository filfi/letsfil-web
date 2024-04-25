import { useResponsive } from 'ahooks';

// import CardBack from './CardBack';
import CardMiner from './CardMiner';
import CardRaise from './CardRaise';
import CardAssets from './CardAssets';
import CardLending from './CardLending';
import CardStaking from './CardStaking';

const RaiseSider: React.FC = () => {
  const responsive = useResponsive();

  if (responsive.lg) {
    return (
      <>
        <CardRaise />

        <CardMiner />

        <CardStaking />

        {/* <CardBack /> */}

        <CardAssets />

        <CardLending />

        {/* <CardCalc /> */}
      </>
    );
  }

  return null;
};

export default RaiseSider;
