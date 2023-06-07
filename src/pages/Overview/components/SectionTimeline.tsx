import dayjs from 'dayjs';
import { useMemo } from 'react';

import * as F from '@/utils/format';
import * as U from '@/utils/utils';
import Steps from '@/components/Steps';
import { NodeState } from '@/constants/state';
import useRaiseDetail from '@/hooks/useRaiseDetail';

function isExpire(sec?: number) {
  if (sec) {
    return dayjs(sec * 1000).isBefore(Date.now());
  }
  return false;
}

const StepStart: React.FC = () => {
  const { data, state } = useRaiseDetail();
  const { isWaiting, isStarted } = state;

  const isStart = useMemo(() => isStarted && data?.begin_time, [isStarted, data?.begin_time]);

  return (
    <Steps.Item title="节点计划开启" status={isStart ? 'finish' : isWaiting ? 'active' : undefined}>
      {data?.closing_time ? F.formatUnixDate(data.begin_time) : '主办人决定启动时间'}
    </Steps.Item>
  );
};

const StepClose: React.FC = () => {
  const { data, state } = useRaiseDetail();
  const { nodeState, isClosed, isFailed, isRaising, isSuccess, isWaitSeal, isPreSeal } = state;

  const isRaiseEnd = useMemo(() => isSuccess && nodeState >= NodeState.Started && !isPreSeal, [nodeState, isSuccess, isPreSeal]);
  const isProgress = useMemo(() => isRaising || (isSuccess && (isWaitSeal || isPreSeal)), [isRaising, isSuccess, isWaitSeal, isPreSeal]);

  if (isClosed || isFailed) {
    return (
      <Steps.Item title={isClosed ? '集合质押关闭' : '集合质押失败'} status="active">
        {F.formatUnixDate(data!.closing_time)}
      </Steps.Item>
    );
  }

  return (
    <Steps.Item title="集合质押截止" status={isRaiseEnd ? 'finish' : isProgress ? 'active' : undefined}>
      {data?.closing_time ? F.formatUnixDate(data.closing_time) : `预期${data!.raise_days}天`}
    </Steps.Item>
  );
};

const StepSeal: React.FC = () => {
  const { data, state } = useRaiseDetail();
  const { isSealing, isDelayed, isWorking } = state;

  return (
    <Steps.Item
      title={
        <>
          <span>封装阶段截止</span>
          {isSealing && <span className="fw-normal opacity-75">（预计 {U.diffDays(data!.end_seal_time)}）</span>}
        </>
      }
      status={isWorking ? 'finish' : isSealing || isDelayed ? 'active' : undefined}
    >
      {data?.delay_seal_time ? F.formatUnixDate(data.delay_seal_time) : data?.end_seal_time ? F.formatUnixDate(data.end_seal_time) : `+ ${data!.seal_days} 天`}
    </Steps.Item>
  );
};

const StepWork: React.FC = () => {
  const { data, state } = useRaiseDetail();
  const { isFinished, isDestroyed, isWorking } = state;

  return (
    <Steps.Item title="节点生产阶段" status={isDestroyed ? 'finish' : isFinished ? 'active' : undefined}>
      {isWorking ? '产出和分配节点激励' : `+${data!.sector_period}天`}
    </Steps.Item>
  );
};

const StepEnd: React.FC = () => {
  const { data, state } = useRaiseDetail();
  const { isFinished, isDestroyed, isWorking } = state;
  const endSec = useMemo(() => (data?.end_seal_time ? data.end_seal_time + U.day2sec(data.sector_period) : 0), [data]);

  return (
    <Steps.Item
      title={
        <>
          <span>扇区到期</span>
          {isFinished && <span className="fw-normal opacity-75">（{data?.sector_period}天）</span>}
        </>
      }
      status={isDestroyed ? (isExpire(endSec) ? 'finish' : 'active') : undefined}
    >
      {isWorking ? (
        <>
          <p className="mb-0">最早 {F.formatRemain(data!.end_seal_time, U.day2sec(data!.sector_period))}</p>
          <p className="mb-0">最晚 {F.formatRemain(data!.end_seal_time, U.day2sec(data!.sector_period))}</p>
        </>
      ) : (
        <>
          <p className="mb-0">最早 -</p>
          <p className="mb-0">最晚 -</p>
        </>
      )}
    </Steps.Item>
  );
};

const SectionTimeline: React.FC = () => {
  return (
    <>
      <Steps>
        <StepStart />

        <StepClose />

        <StepSeal />

        <StepWork />

        <StepEnd />
      </Steps>
    </>
  );
};

export default SectionTimeline;
