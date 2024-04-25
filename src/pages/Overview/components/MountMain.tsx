import { useModel } from '@umijs/max';
import { useResponsive } from 'ahooks';

import CardMount from './CardMount';
import MountNode from './MountNode';
import { isClosed } from '@/helpers/raise';
import MountDetails from './MountDetails';
import SectionEvents from './SectionEvents';
import SectionReward from './SectionReward';
import SectionContract from './SectionContract';
import SectionProvider from './SectionProvider';
import useMountState from '@/hooks/useMountState';

const MountMain: React.FC = () => {
  const { plan } = useModel('Overview.overview');

  const responsive = useResponsive();
  const { isStarted } = useMountState(plan);

  return (
    <>
      <section id="sector" className="section">
        {plan && !isClosed(plan) && isStarted && (
          <div className="section-header">
            <h4 className="section-title">分配計劃@{plan?.miner_id}</h4>
            <p className="mb-0">掛載成功</p>
          </div>
        )}

        <div className="vstack gap-3">
          <MountNode />

          {responsive.lg ? null : <CardMount />}
        </div>
      </section>
      <section id="reward" className="section">
        <div className="section-header">
          <h4 className="section-title">分配方案</h4>
          <p className="mb-0">智能合約嚴格執行分配方案，堅定履約，透明可信，省時省心。</p>
        </div>

        <SectionReward />
      </section>
      <section id="details" className="section">
        <div className="section-header">
          <h4 className="section-title">分配明細</h4>
          <p className="mb-0">歷史節點掛載到FilFi智能合約，並依照約定分配方案自動分配。</p>
        </div>

        <MountDetails />
      </section>
      <section id="provider" className="section">
        <div className="section-header">
          <h4 className="section-title">服務商</h4>
          <p className="mb-0">開創鏈上協作新模式，專業化服務，負責任承諾。</p>
        </div>

        <SectionProvider />
      </section>
      <section id="contract" className="section">
        <div className="section-header">
          <h4 className="section-title">智能合約</h4>
          <p className="mb-0">
            分配計畫是部署在Filecoin上的智慧合約，歷史節點掛載到FilFi網路後，激勵分配完全由智慧合約管理。
          </p>
        </div>

        <SectionContract />
      </section>
      {isStarted && (
        <section id="events" className="section">
          <div className="section-header">
            <h4 className="section-title">事件</h4>
            <p className="mb-0">分配計劃發生的重要事件以及鏈上相關訊息</p>
          </div>

          <SectionEvents />
        </section>
      )}
    </>
  );
};

export default MountMain;
