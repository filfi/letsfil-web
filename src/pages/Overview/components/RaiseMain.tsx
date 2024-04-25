import classNames from 'classnames';
import { useResponsive } from 'ahooks';
import { useModel } from '@umijs/max';

import CardBack from './CardBack';
import CardMiner from './CardMiner';
import CardRaise from './CardRaise';
import CardAssets from './CardAssets';
import CardLending from './CardLending';
import CardStaking from './CardStaking';
import SectionRaise from './SectionRaise';
import SectionNode from './SectionNode';
import SectionSeals from './SectionSeals';
import SectionEvents from './SectionEvents';
import SectionPledge from './SectionPledge';
import SectionReward from './SectionReward';
import SectionDeposit from './SectionDeposit';
import SectionContract from './SectionContract';
import SectionTimeline from './SectionTimeline';
import SectionProvider from './SectionProvider';
import SectionWhitelist from './SectionWhitelist';
import { isTargeted } from '@/helpers/raise';

const RaiseMain: React.FC = () => {
  const responsive = useResponsive();
  const { plan, role, state } = useModel('Overview.overview');

  const { isRaiser } = role ?? {};
  const { isStarted, isSealing, isDelayed, isFinished, isDestroyed } = state ?? {};

  return (
    <>
      <section id="raising" className="section">
        <div className="d-flex flex-column gap-3">
          <SectionRaise />

          {responsive.lg ? null : (
            <>
              <CardRaise />

              <CardMiner />

              <CardStaking />

              <CardBack />

              <CardAssets />

              <CardLending />

              {/* <CardCalc /> */}
            </>
          )}
        </div>
      </section>
      {isTargeted(plan) && isRaiser && (
        <section id="targeted" className="section">
          <div className="section-header">
            <h4 className="section-title">定向地址</h4>
            <p className="mb-0">可參與定向計劃的錢包地址和參與情況。</p>
          </div>

          <SectionWhitelist />
        </section>
      )}
      {(isSealing || isDelayed || isFinished) && (
        <section id="seals" className="section">
          <div className="section-header">
            <h4 className="section-title">封裝進度</h4>
            <p className="mb-0">封裝進度一覽無餘</p>
          </div>

          <SectionSeals />
        </section>
      )}
      <section
        id="provider"
        className={classNames('section', { 'order-3': isSealing, 'order-5': isDelayed || isFinished })}
      >
        <div className="section-header">
          <h4 className="section-title">服務商</h4>
          <p className="mb-0">開創鏈上協作新模式，專業化服務，負責任承諾。</p>
        </div>

        <SectionProvider />
      </section>
      <section
        id="deposit"
        className={classNames('section', { 'order-3': isSealing, 'order-5': isDelayed || isFinished || isDestroyed })}
      >
        <div className="section-header">
          <h4 className="section-title">保證金</h4>
          <p className="mb-0">保障節點計畫執行，違約自動觸發懲罰機制，保護建設者權益。</p>
        </div>

        <SectionDeposit />
      </section>
      <section id="reward" className="section order-2">
        <div className="section-header">
          <h4 className="section-title">分配方案</h4>
          <p className="mb-0">智能合約嚴格執行分配方案，堅定履約，透明可信，省時省心。</p>
        </div>

        <SectionReward />
      </section>
      <section id="pledge" className="section order-2">
        <div className="section-header">
          <h4 className="section-title">質押的歸屬</h4>
          <p className="mb-0">質押的所有權永恆不變，投入多少返回多少。</p>
        </div>

        <SectionPledge />
      </section>
      <section id="sector" className="section order-3">
        <div className="section-header">
          <h4 className="section-title">建設方案</h4>
          <p className="mb-0">質押的FIL定向使用，用途不可更改，智能合約保障每個FIL去向可查。</p>
        </div>

        <SectionNode />
      </section>
      <section id="timeline" className="section order-4">
        <div className="section-header">
          <h4 className="section-title">時間進度</h4>
          <p className="mb-0">建設進展盡在掌握。</p>
        </div>

        <SectionTimeline />
      </section>
      <section id="contract" className="section order-5">
        <div className="section-header">
          <h4 className="section-title">智能合約</h4>
          <p className="mb-0">節點計劃是部署在Filecoin上的智慧合約，儲存節點的建置和激勵分配完全由智慧合約管理。</p>
        </div>

        <SectionContract />
      </section>
      {isStarted && (
        <section id="events" className="section order-5">
          <div className="section-header">
            <h4 className="section-title">事件</h4>
            <p className="mb-0">節點計畫發生的重要事件以及鏈上相關訊息</p>
          </div>

          <SectionEvents />
        </section>
      )}
    </>
  );
};

export default RaiseMain;
