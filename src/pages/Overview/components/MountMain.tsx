import { useResponsive } from 'ahooks';

import CardBack from './CardBack';
import CardMiner from './CardMiner';
import CardRaise from './CardRaise';
import CardAssets from './CardAssets';
import CardStaking from './CardStaking';
import SectionNode from './SectionNode';
import SectionEvents from './SectionEvents';
import SectionReward from './SectionReward';
import SectionContract from './SectionContract';
import SectionProvider from './SectionProvider';
import useMountState from '@/hooks/useMountState';

const MountMain: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const responsive = useResponsive();
  const { isStarted } = useMountState(data);

  return (
    <>
      <section id="sector" className="section">
        {isStarted && (
          <div className="section-header">
            <h4 className="section-title">分配计划@{data?.miner_id}</h4>
            <p className="mb-0">挂载成功</p>
          </div>
        )}

        <div className="vstack gap-3">
          <SectionNode data={data} />

          {responsive.lg ? null : (
            <>
              <CardRaise data={data} />

              <CardMiner data={data} />

              <CardStaking data={data} />

              <CardBack data={data} />

              <CardAssets data={data} />

              {/* <CardCalc /> */}
            </>
          )}
        </div>
      </section>
      <section id="reward" className="section">
        <div className="section-header">
          <h4 className="section-title">分配方案</h4>
          <p className="mb-0">智能合约严格执行分配方案，坚定履约，透明可信，省时省心。</p>
        </div>

        <SectionReward data={data} />
      </section>
      <section id="details" className="section">
        <div className="section-header">
          <h4 className="section-title">分配明细</h4>
          <p className="mb-0">历史节点挂载到FilFi智能合约，按照约定分配方案自动分配。</p>
        </div>

        <SectionReward data={data} />
      </section>
      <section id="provider" className="section">
        <div className="section-header">
          <h4 className="section-title">服务商</h4>
          <p className="mb-0">开创链上协作新模式，专业化服务，负责任承诺。</p>
        </div>

        <SectionProvider data={data} />
      </section>
      <section id="contract" className="section">
        <div className="section-header">
          <h4 className="section-title">智能合约</h4>
          <p className="mb-0">分配计划是部署在Filecoin上的智能合约，历史节点挂载到FilFi网络后，激励分配完全由智能合约管理。</p>
        </div>

        <SectionContract data={data} />
      </section>
      {isStarted && (
        <section id="events" className="section">
          <div className="section-header">
            <h4 className="section-title">事件</h4>
            <p className="mb-0">分配计划发生的重要事件以及链上相关消息</p>
          </div>

          <SectionEvents data={data} />
        </section>
      )}
    </>
  );
};

export default MountMain;
