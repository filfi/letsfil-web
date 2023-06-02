import dayjs from 'dayjs';
import { useMemo } from 'react';

import * as F from '@/utils/format';
import * as U from '@/utils/utils';
import Steps from '@/components/Steps';
import useRaiseState from '@/hooks/useRaiseState';
import type { ItemProps } from './types';

function isExpire(sec?: number) {
  if (sec) {
    return dayjs(sec * 1000).isBefore(Date.now());
  }
  return false;
}

const SectionTimeline: React.FC<ItemProps> = ({ data }) => {
  const { isWaiting, isClosed, isFailed, isFinished, isDelayed, isDestroyed, isRaising, isSuccess, isSealing, isStarted, isWorking } = useRaiseState(data);

  const isStart = useMemo(() => !!(data?.begin_time && isStarted), [isStarted, data?.begin_time]);
  const endSec = useMemo(() => (data && data.end_seal_time ? data.end_seal_time + U.day2sec(data.sector_period) : 0), [data]);

  if (!data) return null;

  return (
    <>
      <Steps>
        <Steps.Item title="募集计划开启" status={isStart ? 'finish' : isWaiting ? 'active' : undefined}>
          {isStart ? F.formatUnixDate(data.begin_time) : '尚未开启'}
        </Steps.Item>

        {isClosed || isFailed ? (
          <Steps.Item title={isClosed ? '募集关闭' : '募集失败'} status="active">
            {F.formatUnixDate(data.closing_time)}
          </Steps.Item>
        ) : (
          <Steps.Item title="募集计划截止" status={isSuccess ? 'finish' : isRaising ? 'active' : undefined}>
            {isStarted ? F.formatUnixDate(data.closing_time) : `预期${data.raise_days}天`}
          </Steps.Item>
        )}

        <Steps.Item
          title={
            <>
              <span>封装阶段截止</span>
              {isSealing && <span className="fw-normal opacity-75">（预计 {U.diffDays(data.end_seal_time)}）</span>}
            </>
          }
          status={isWorking ? 'finish' : isSealing || isDelayed ? 'active' : undefined}
        >
          {data.delay_seal_time
            ? F.formatUnixDate(data.delay_seal_time)
            : data.end_seal_time
            ? F.formatUnixDate(data.end_seal_time)
            : `预计 ${data.seal_days} 天`}
        </Steps.Item>

        <Steps.Item title="节点生产阶段" status={isDestroyed ? 'finish' : isFinished ? 'active' : undefined}>
          {isWorking ? '产出和分配收益' : `+${data.sector_period}天`}
        </Steps.Item>

        <Steps.Item
          title={
            <>
              <span>扇区到期</span>
              {isFinished && <span className="fw-normal opacity-75">（{data.sector_period}天）</span>}
            </>
          }
          status={isDestroyed ? (isExpire(endSec) ? 'finish' : 'active') : undefined}
        >
          {isWorking ? (
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
