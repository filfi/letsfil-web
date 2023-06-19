import classNames from 'classnames';
import { useResponsive } from 'ahooks';

import CardBack from './CardBack';
import CardRaise from './CardRaise';
import CardAssets from './CardAssets';
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
import useRaiseState from '@/hooks/useRaiseState';

const ContMain: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const responsive = useResponsive();
  const { isStarted, isSuccess, isWaitSeal, isPreSeal, isSealing, isDelayed, isFinished, isDestroyed } = useRaiseState(data);

  return (
    <>
      <section id="raising" className="section">
        <div className="d-flex flex-column gap-3">
          <SectionRaise data={data} />

          {responsive.lg ? null : (
            <>
              <CardRaise data={data} />

              <CardStaking data={data} />

              <CardBack data={data} />

              <CardAssets data={data} />

              {/* <CardCalc /> */}
            </>
          )}
        </div>
      </section>
      <section id="provider" className={classNames('section', { 'order-3': isSealing, 'order-5': isDelayed || isFinished })}>
        <div className="section-header">
          <h4 className="section-title">服务商</h4>
          <p className="mb-0">开创链上协作新模式，专业化服务，负责任承诺。</p>
        </div>

        <SectionProvider data={data} />
      </section>
      <section id="deposit" className={classNames('section', { 'order-3': isSealing, 'order-5': isDelayed || isFinished || isDestroyed })}>
        <div className="section-header">
          <h4 className="section-title">保证金</h4>
          <p className="mb-0">保障节点计划执行，违约自动触发惩罚机制，保护建设者权益。</p>
        </div>

        <SectionDeposit data={data} />
      </section>
      <section id="reward" className="section order-2">
        <div className="section-header">
          <h4 className="section-title">分配方案</h4>
          <p className="mb-0">智能合约严格执行分配方案，坚定履约，透明可信，省时省心。</p>
        </div>

        <SectionReward data={data} />
      </section>
      <section id="pledge" className="section order-2">
        <div className="section-header">
          <h4 className="section-title">质押的归属</h4>
          <p className="mb-0">质押的所有权永恒不变，投入多少返回多少。</p>
        </div>

        <SectionPledge data={data} />
      </section>
      <section id="sector" className="section order-3">
        <div className="section-header">
          <h4 className="section-title">建设方案</h4>
          <p className="mb-0">质押的FIL定向使用，用途不可更改，智能合约保障每个FIL去向可查。</p>
        </div>

        <SectionNode data={data} />
      </section>
      {isSuccess && !isDestroyed && (
        <section id="seals" className={classNames('section', { 'order-1': isSealing || isDelayed || isFinished, 'order-3': isWaitSeal || isPreSeal })}>
          <div className="section-header">
            <h4 className="section-title">封装进度</h4>
            <p className="mb-0">封装进展一览无余</p>
          </div>

          <SectionSeals data={data} />
        </section>
      )}
      <section id="timeline" className="section order-4">
        <div className="section-header">
          <h4 className="section-title">时间进度</h4>
          <p className="mb-0">建设者进展尽在掌握。</p>
        </div>

        <SectionTimeline data={data} />
      </section>
      <section id="contract" className="section order-5">
        <div className="section-header">
          <h4 className="section-title">智能合约</h4>
          <p className="mb-0">节点计划是部署在Filecoin上的智能合约，存储节点的建设和激励分配完全由智能合约管理。</p>
        </div>

        <SectionContract data={data} />
      </section>
      {isStarted && (
        <section id="events" className="section order-5">
          <div className="section-header">
            <h4 className="section-title">事件</h4>
            <p className="mb-0">节点计划发生的重要事件以及链上相关消息</p>
          </div>

          <SectionEvents data={data} />
        </section>
      )}
    </>
  );
};

export default ContMain;
