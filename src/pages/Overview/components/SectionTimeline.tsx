import { useMemo } from 'react';

import * as F from '@/utils/format';
import * as U from '@/utils/utils';
import Steps from '@/components/Steps';
import useRaiseState from '@/hooks/useRaiseState';
import type { ItemProps } from './types';

const SectionTimeline: React.FC<ItemProps> = ({ data }) => {
  const { isClosed, isFailed, isFinished, isDestroyed, isRaising, isSuccess, isSealing, isSigned, isStarted } = useRaiseState(data);

  const isStart = useMemo(() => !!(data?.begin_time && isStarted), [isStarted, data?.begin_time]);

  if (!data) return null;

  return (
    <>
      <Steps>
        <Steps.Item title="募集计划开启" status={isStart ? 'finish' : isSigned ? 'active' : undefined}>
          {isStart ? F.formatUnixDate(data.begin_time) : '尚未开启'}
        </Steps.Item>

        <Steps.Item title="募集计划截止" status={isSuccess ? 'finish' : isClosed || isFailed || isRaising ? 'active' : undefined}>
          {data.closing_time ? F.formatUnixDate(data.closing_time) : `预期${data.raise_days}天`}
        </Steps.Item>

        <Steps.Item
          title={
            <>
              <span>封装阶段截止</span>
              {isSealing && <span className="fw-normal opacity-75">（预计 {U.diffDays(data.closing_time + U.day2sec(data.seal_days))}）</span>}
            </>
          }
          status={isFinished ? 'finish' : isSealing ? 'active' : undefined}
        >
          {isFinished ? F.formatUnixDate(data.end_seal_time) : `预计 ${data.seal_days} 天`}
        </Steps.Item>

        <Steps.Item title="节点生产阶段" status={isDestroyed ? 'finish' : isFinished ? 'active' : undefined}>
          {isFinished ? '产出和分配收益' : `+${data.sector_period}天`}
        </Steps.Item>

        <Steps.Item
          title={
            <>
              <span>扇区到期</span>
              {isFinished && <span className="fw-normal opacity-75">（{data.sector_period}天）</span>}
            </>
          }
        >
          {isFinished ? (
            <>
              <p className="mb-0">最早 {F.formatRemain(data.end_seal_time, U.day2sec(data.sector_period))}</p>
              <p className="mb-0">最晚 {F.formatRemain(data.end_seal_time, U.day2sec(data.sector_period))}</p>
            </>
          ) : (
            `+${data.sector_period}天`
          )}
        </Steps.Item>
      </Steps>
    </>
  );
};

export default SectionTimeline;
