import { useMemo } from 'react';
import { Link } from '@umijs/max';
import { useRequest } from 'ahooks';

import * as F from '@/utils/format';
import { getInfo } from '@/apis/raise';
import { accAdd } from '@/utils/utils';
import ShareBtn from '@/components/ShareBtn';
import useAssetPack from '@/hooks/useAssetPack';
import useRaiseRole from '@/hooks/useRaiseRole';
import useRewardRaiser from '@/hooks/useRewardRaiser';
import useRewardInvestor from '@/hooks/useRewardInvestor';
import useRewardServicer from '@/hooks/useRewardServicer';
import useDepositInvestor from '@/hooks/useDepositInvestor';
import { ReactComponent as IconHD } from '@/assets/icons/hard-drive.svg';
import { ReactComponent as IconShare } from '@/assets/icons/share-04.svg';

const PackCard: React.FC<{ data: API.Pack }> = ({ data }) => {
  const { data: info } = useRequest(() => getInfo(data.raising_id), { refreshDeps: [data.raising_id] });

  const raiser = useRewardRaiser(info);
  const investor = useRewardInvestor(info);
  const servicer = useRewardServicer(info);
  const { isInvestor } = useDepositInvestor(info);
  const { isRaiser, isServicer } = useRaiseRole(info);
  const { holdPower, holdPledge } = useAssetPack(info);

  const rewward = useMemo(() => {
    let sum = 0;

    if (isInvestor) {
      sum = accAdd(sum, investor.reward);
    }

    if (isRaiser) {
      sum = accAdd(sum, raiser.reward);
    }

    if (isServicer) {
      sum = accAdd(sum, servicer.reward);
    }

    return sum;
  }, [investor.reward, raiser.reward, servicer.reward, isInvestor, isRaiser, isServicer]);

  return (
    <div className="card h-100">
      <div className="card-header d-flex align-items-center">
        <IconHD />

        <h4 className="card-title mb-0 mx-2">
          {data.asset_pack_id}@{data.miner_id}
        </h4>

        <ShareBtn className="btn border-0 p-0 ms-auto" text={`${location.origin}/assets/${data.raising_id}`}>
          <IconShare />
        </ShareBtn>
      </div>
      <div className="card-body py-1">
        <p className="d-flex my-3 gap-3">
          <span className="text-gray-dark">持有算力(QAP)</span>
          <span className="ms-auto">
            <span className="fs-16 fw-600">{F.formatPower(holdPower)?.[0]}</span>
            <span className="text-gray-dark ms-1">{F.formatPower(holdPower)?.[1]}</span>
          </span>
        </p>
        <p className="d-flex my-3 gap-3">
          <span className="text-gray-dark">持有质押</span>
          <span className="ms-auto">
            <span className="fs-16 fw-600">{F.formatAmount(holdPledge)}</span>
            <span className="text-gray-dark ms-1">FIL</span>
          </span>
        </p>
        <p className="d-flex my-3 gap-3">
          <span className="text-gray-dark">可提余额</span>
          <span className="ms-auto">
            <span className="fs-16 fw-600">{F.formatAmount(rewward)}</span>
            <span className="text-gray-dark ms-1">FIL</span>
          </span>
        </p>
      </div>
      <div className="card-footer d-flex">
        <Link className="btn btn-primary ms-auto" to={`/assets/${data.raising_id}`}>
          提取节点激励
        </Link>
      </div>
    </div>
  );
};

export default PackCard;
