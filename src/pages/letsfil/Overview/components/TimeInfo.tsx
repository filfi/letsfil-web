import { useMemo } from 'react';

import * as F from '@/utils/format';
import Steps from '@/components/Steps';
import { sec2day } from '@/utils/utils';
import { NodeState, RaiseState } from '@/constants/state';

const TimeInfo: React.FC<{
  data?: API.Base;
  planState?: number;
  nodeState?: number;
}> = ({ data, nodeState = 0, planState = 0 }) => {
  const items = useMemo(
    () => [
      {
        title: '发布募集计划',
        active: true,
        desc: F.formatSecDate(data?.raise_create_time),
      },
      {
        active: planState > RaiseState.InProgress,
        title: planState === RaiseState.Failed ? '募集已截止，未达成目标，募集失败。您质押的的FIL已发送到个人账户，待提取' : '募集截止',
        desc: `${F.formatSecDate(data?.end_seal_time)} 募集总额 ${F.formatEther(data?.target_amount)} FIL`,
      },
      {
        title: '节点封装中',
        active: planState === RaiseState.Successed && nodeState < NodeState.End,
        desc: `预计需要${sec2day(data?.seal_time_limit)}天，已完成${F.formatPercent(data?.progress)}`,
      },
      {
        title: '节点生产阶段',
        desc: '产出和分配收益',
        active: planState === RaiseState.Successed && nodeState >= NodeState.End && nodeState < NodeState.Failure,
      },
      {
        title: '解除质押',
        // 计划成功且节点已销毁 或 计划关闭或失败
        active: (planState === RaiseState.Successed && nodeState === NodeState.Destroy) || planState === RaiseState.Closed || planState === RaiseState.Failed,
        desc: `预计为${F.formatRemain(data?.raise_create_time, data?.sector_period)}，扇区有效期 ${sec2day(data?.sector_period)}天`,
      },
    ],
    [data, planState, nodeState],
  );

  const current = useMemo(() => items.findLastIndex((item) => item.active), [items]);

  return (
    <>
      <Steps current={current} items={items} />
    </>
  );
};

export default TimeInfo;
