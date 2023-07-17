import dayjs from 'dayjs';
import { useMemo } from 'react';

import * as F from '@/utils/format';
import Steps from '@/components/Steps';
import { NodeState } from '@/constants/state';
import usePackInfo from '@/hooks/usePackInfo';
import useRaiseState from '@/hooks/useRaiseState';

function isExpire(sec?: number) {
  if (sec) {
    return dayjs(sec * 1000).isBefore(Date.now());
  }
  return false;
}

const StepStart: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { isWaiting, isStarted } = useRaiseState(data);

  const isStart = useMemo(() => isStarted && data?.begin_time, [isStarted, data?.begin_time]);

  return (
    <Steps.Item title="质押开放" status={isStart ? 'finish' : isWaiting ? 'active' : undefined}>
      {data?.closing_time ? F.formatUnixDate(data.begin_time) : '主办人决定开放时间'}
    </Steps.Item>
  );
};

const StepClose: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { nodeState, isClosed, isFailed, isRaising, isSuccess, isWaitSeal } = useRaiseState(data);

  const isRaiseEnd = useMemo(() => isSuccess && nodeState >= NodeState.Started, [nodeState, isSuccess]);
  const isProgress = useMemo(() => !isSuccess && (isRaising || isWaitSeal), [isRaising, isSuccess, isWaitSeal]);

  if (isClosed || isFailed) {
    return (
      <Steps.Item title={isClosed ? '质押关闭' : '质押失败'} status="active">
        {F.formatUnixDate(data!.closing_time)}
      </Steps.Item>
    );
  }

  return (
    <Steps.Item title="质押阶段截止" status={isRaiseEnd ? 'finish' : isProgress ? 'active' : undefined}>
      {data?.closing_time ? F.formatUnixDate(data.closing_time) : `预期${data!.raise_days}天`}
    </Steps.Item>
  );
};

const StepSeal: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { isSuccess, isSealing, isDelayed, isWorking } = useRaiseState(data);

  return (
    <Steps.Item title="封装阶段截止" status={isWorking ? 'finish' : isSuccess && (isSealing || isDelayed) ? 'active' : undefined}>
      {data?.end_seal_time ? F.formatUnixDate(data.end_seal_time) : `+ ${data!.seal_days} 天`}
    </Steps.Item>
  );
};

const StepWork: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { isFinished, isDestroyed, isWorking } = useRaiseState(data);

  return (
    <Steps.Item title="运维阶段" status={isDestroyed ? 'finish' : isFinished ? 'active' : undefined}>
      {isWorking ? '产出和分配Filecoin激励' : `+${data!.sector_period}天`}
    </Steps.Item>
  );
};

const StepEnd: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { data: pack } = usePackInfo(data);
  const { isFinished, isDestroyed, isWorking } = useRaiseState(data);

  return (
    <Steps.Item
      title={
        <>
          <span>扇区到期</span>
          {isFinished && <span className="fw-normal opacity-75">（{data?.sector_period}天）</span>}
        </>
      }
      status={isDestroyed ? (isExpire(pack?.max_expiration_epoch) ? 'finish' : 'active') : undefined}
    >
      {isWorking ? (
        <>
          <p className="mb-0">最早 {F.formatUnixDate(pack?.min_expiration_epoch, 'll')}</p>
          <p className="mb-0">最晚 {F.formatUnixDate(pack?.max_expiration_epoch, 'll')}</p>
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

const SectionTimeline: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  return (
    <>
      <Steps>
        <StepStart data={data} />

        <StepClose data={data} />

        <StepSeal data={data} />

        <StepWork data={data} />

        <StepEnd data={data} />
      </Steps>
    </>
  );
};

export default SectionTimeline;
