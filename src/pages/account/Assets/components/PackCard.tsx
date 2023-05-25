import { Link } from '@umijs/max';
import { useRequest } from 'ahooks';

import { isDef } from '@/utils/utils';
import { getInfo } from '@/apis/raise';
import ShareBtn from '@/components/ShareBtn';
import useAssetPack from '@/hooks/useAssetPack';
import { formatAmount, formatNum } from '@/utils/format';
import { ReactComponent as IconHD } from '@/assets/icons/hard-drive.svg';
import { ReactComponent as IconShare } from '@/assets/icons/share-04.svg';

function formatPower(val?: number | string) {
  if (isDef(val)) {
    return formatNum(val, '0.0 ib').split(' ');
  }
}

const PackCard: React.FC<{ data: API.Pack }> = ({ data }) => {
  const { data: info } = useRequest(() => getInfo(data.raising_id), { refreshDeps: [data.raising_id] });

  const { holdPower, holdPledge } = useAssetPack(info, { power: data.total_power, pledge: data.total_pledge_amount });

  return (
    <div className="card h-100">
      <div className="card-header d-flex align-items-center">
        <IconHD />

        <h4 className="card-title mb-0 mx-2">
          {data.asset_pack_id}@{data.miner_id}
        </h4>

        <ShareBtn className="btn border-0 p-0 ms-auto">
          <IconShare />
        </ShareBtn>
      </div>
      <div className="card-body py-1">
        <p className="d-flex my-3 gap-3">
          <span className="text-gray-dark">持有算力(QAP)</span>
          <span className="ms-auto">
            <span className="fs-16 fw-600">{formatPower(holdPower)?.[0]}</span>
            <span className="text-gray-dark ms-1">{formatPower(holdPower)?.[1]}</span>
          </span>
        </p>
        <p className="d-flex my-3 gap-3">
          <span className="text-gray-dark">持有质押币</span>
          <span className="ms-auto">
            <span className="fs-16 fw-600">{formatAmount(holdPledge)}</span>
            <span className="text-gray-dark ms-1">FIL</span>
          </span>
        </p>
        <p className="d-flex my-3 gap-3">
          <span className="text-gray-dark">可提余额</span>
          <span className="ms-auto">
            <span className="fs-16 fw-600">{formatAmount(holdPledge)}</span>
            <span className="text-gray-dark ms-1">FIL</span>
          </span>
        </p>
      </div>
      <div className="card-footer d-flex">
        <Link className="btn btn-primary ms-auto" to={`/assets/${data.raising_id}`}>
          提取收益
        </Link>
      </div>
    </div>
  );
};

export default PackCard;
