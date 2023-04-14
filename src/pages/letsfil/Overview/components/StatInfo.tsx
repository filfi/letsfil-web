import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useMount, useRequest } from 'ahooks';

import * as F from '@/utils/format';
import { accSub } from '@/utils/utils';
import { statAsset } from '@/apis/raise';
import usePlanContract from '@/hooks/usePlanContract';

function formatNow(time?: number | string) {
  if (time) {
    return dayjs().diff(dayjs(+time * 1000), 'days');
  }

  return 0;
}

const StatInfo: React.FC<{ data?: API.Base }> = ({ data }) => {
  const [reward, setReward] = useState(0); // 总奖励
  const [pledge, setPledge] = useState(0); // 总质押
  const [released, setReleased] = useState(0); // 已释放
  // 待释放
  const vesting = useMemo(() => accSub(reward, released), [released, reward]);

  const service = async () => {
    if (data?.raising_id) {
      return await statAsset(data.raising_id);
    }

    return undefined;
  };

  const { data: stat } = useRequest(service, { refreshDeps: [data?.raising_id] });

  const plan = usePlanContract(data?.raise_address);

  const fetchAmounts = async () => {
    const contract = plan.getContract();
    const pledge = await contract?.pledgeTotalAmount();
    const reward = await contract?.totalRewardAmount();
    const released = await contract?.totalReleasedRewardAmount();

    setReward(F.toNumber(reward));
    setPledge(F.toNumber(pledge));
    setReleased(F.toNumber(released));
  };

  useMount(fetchAmounts);

  return (
    <>
      <div className="row row-cols-1 row-cols-md-2 g-3 mb-3 mb-lg-4">
        <div className="col">
          <div className="card h-100">
            <div className="card-body">
              <p className="mb-1 text-gray-dark">已产出</p>
              <p className="mb-0 d-flex align-items-center">
                <span className="fs-5 fw-bold">
                  <span className="fs-3">{F.formatNum(reward, '0a')}</span>
                  <span className="ms-1 text-neutral">FIL</span>
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card h-100">
            <div className="card-body">
              <p className="mb-1 text-gray-dark">已分配</p>
              <p className="mb-0 d-flex flex-wrap align-items-center">
                <span className="fs-5 fw-bold">
                  <span className="fs-3">{F.formatNum(released, '0a')}</span>
                  <span className="ms-1 text-neutral">FIL</span>
                </span>
                <span className="badge badge-primary ms-auto">{formatNow(data?.begin_seal_time)}天</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table">
          <tbody>
            <tr>
              <th>待释放FIL</th>
              <td>{F.formatAmount(vesting)} FIL</td>
              <th>质押FIL</th>
              <td>{F.formatAmount(pledge)} FIL</td>
            </tr>
            <tr>
              <th>节点规模</th>
              <td>{F.formatByte(data?.target_power)}</td>
              <th>受益人</th>
              <td>{stat?.investor_count ?? '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default StatInfo;
