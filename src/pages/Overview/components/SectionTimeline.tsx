import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useModel } from '@umijs/max';

import * as F from '@/utils/format';
import Steps from '@/components/Steps';
import { NodeState } from '@/constants/state';

function isExpire(sec?: number) {
  if (sec) {
    return dayjs(sec * 1000).isBefore(Date.now());
  }
  return false;
}

const StepStart: React.FC = () => {
  const { plan, state } = useModel('Overview.overview');
  const { isStarted, isWaiting } = state;

  const isStart = useMemo(() => isStarted && plan?.begin_time, [isStarted, plan?.begin_time]);

  return (
    <Steps.Item title="質押開放" status={isStart ? 'finish' : isWaiting ? 'active' : undefined}>
      {plan?.closing_time ? F.formatUnixDate(plan.begin_time) : '主辦人決定開放時間'}
    </Steps.Item>
  );
};

const StepClose: React.FC = () => {
  const { plan, state } = useModel('Overview.overview');
  const { nodeState, isClosed, isFailed, isRaising, isSuccess, isDestroyed, isWaitSeal } = state;

  const isProgress = useMemo(() => !isSuccess && (isRaising || isWaitSeal), [isRaising, isSuccess, isWaitSeal]);
  const isRaiseEnd = useMemo(
    () => (isDestroyed || isSuccess) && nodeState >= NodeState.Started,
    [nodeState, isDestroyed, isSuccess],
  );

  if (isClosed || isFailed) {
    return (
      <Steps.Item title={isClosed ? '質押關閉' : '質押失敗'} status="active">
        {F.formatUnixDate(plan!.closing_time)}
      </Steps.Item>
    );
  }

  const formatEndTime = (time: number) => {
    const r = [F.formatUnixDate(time)];

    if (isProgress) {
      r.push('(可能提前)');
    }

    return r.join(' ');
  };

  return (
    <Steps.Item title="質押階段截止" status={isRaiseEnd ? 'finish' : isProgress ? 'active' : undefined}>
      {plan?.closing_time ? formatEndTime(plan.closing_time) : `預期${plan!.raise_days}天`}
    </Steps.Item>
  );
};

const StepSeal: React.FC = () => {
  const { plan, state } = useModel('Overview.overview');
  const { isSuccess, isSealing, isDelayed, isWorking } = state;

  const formatEndTime = (time: number) => {
    const r = [F.formatUnixDate(time)];

    if (isSealing || isDelayed) {
      r.push('(可能提前)');
    }

    return r.join(' ');
  };

  return (
    <>
      <Steps.Item
        title="開始分配激勵"
        status={isWorking ? 'finish' : isSuccess && (isSealing || isDelayed) ? 'active' : undefined}
      >
        質押結束即開始分配激勵
      </Steps.Item>

      <Steps.Item title="封裝階段截止" status={isWorking ? 'finish' : undefined}>
        {plan?.end_seal_time ? formatEndTime(plan.end_seal_time) : `+ ${plan!.seal_days} 天`}
      </Steps.Item>
    </>
  );
};

const StepWork: React.FC = () => {
  const { plan, state } = useModel('Overview.overview');
  const { isFinished, isDestroyed, isWorking } = state;

  return (
    <Steps.Item title="運維階段" status={isDestroyed ? 'finish' : isFinished ? 'active' : undefined}>
      {isWorking ? '產出與分配Filecoin激勵' : `+${plan!.sector_period}天`}
    </Steps.Item>
  );
};

const StepEnd: React.FC = () => {
  const { pack, plan, state } = useModel('Overview.overview');
  const { isFinished, isDestroyed, isWorking } = state;

  return (
    <Steps.Item
      title={
        <>
          <span>扇區到期</span>
          {isFinished && <span className="fw-normal opacity-75">（{plan?.sector_period}天）</span>}
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

const SectionTimeline: React.FC = () => {
  const { plan } = useModel('Overview.overview');

  if (!plan) return null;

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
