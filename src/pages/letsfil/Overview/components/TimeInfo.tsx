import { useMemo } from 'react';

import * as F from '@/utils/format';
import Steps from '@/components/Steps';
import { sec2day } from '@/utils/utils';
import usePlanState from '@/hooks/usePlanState';
import { NodeState, RaiseState } from '@/constants/state';

const TimeInfo: React.FC<{ data?: API.Plan }> = ({ data }) => {
  const { nodeState, planState } = usePlanState(data?.raise_address);
  const total = useMemo(() => (planState === RaiseState.Successed ? data?.actual_amount : data?.target_amount), [data, planState]);

  const items = useMemo(
    () => [
      {
        title: '发布募集计划',
        active: planState > RaiseState.NotStarted,
        desc: F.formatSecDate(data?.raise_create_time),
      },
      {
        active: planState > RaiseState.InProgress,
        title:
          planState === RaiseState.Closed
            ? '募集计划已关闭。您可在该页面右侧提取质押的FIL。'
            : planState === RaiseState.Failed
            ? '募集已截止，未达成目标，募集失败。您可在该页面右侧提取质押的FIL。'
            : '募集截止',
        desc: data ? `${F.formatSecDate(data?.closing_time)} | 募集总额 ${F.formatEther(total)} FIL` : '',
      },
      {
        title: '节点封装中',
        active: planState === RaiseState.Successed && nodeState < NodeState.End,
        desc: data ? `预计需要${sec2day(data?.seal_time_limit)}天，已完成${F.formatPercent(data?.progress)}` : '',
      },
      {
        title: '节点生产阶段',
        desc: '产出和分配收益',
        active: planState === RaiseState.Successed && nodeState >= NodeState.End && nodeState < NodeState.Failure,
      },
      {
        title: '解除质押',
        active: planState === RaiseState.Successed && nodeState === NodeState.Destroy,
        desc: data ? `预计为${F.formatRemain(data?.end_seal_time, data?.sector_period)}，扇区有效期 ${sec2day(data?.sector_period)}天` : '',
      },
    ],
    [data, planState, nodeState],
  );

  const current = useMemo(() => items.findLastIndex((item) => item.active), [items]);

  return (
    <>
      <Steps current={current === items.length - 1 ? items.length : current} items={items} />
    </>
  );
};

export default TimeInfo;
