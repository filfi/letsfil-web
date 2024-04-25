import { Tooltip } from 'antd';

import useAssetPack from '@/hooks/useAssetPack';
import useRaiseRate from '@/hooks/useRaiseRate';
import { formatAmount, formatPower } from '@/utils/format';

export type ItemProps = {
  pack: API.Pack;
  plan?: API.Plan | null;
};

export default function OpsFundCard({ pack, plan }: React.PropsWithChildren<ItemProps>) {
  const { priorityRate } = useRaiseRate(plan);
  const { opsAmount, opsPower, opsSealsPower } = useAssetPack(plan, pack);

  return (
    <>
      <div className="card-body py-1">
        <p className="d-flex my-3 gap-3">
          <span className="text-gray-dark">我的質押</span>
          <span className="ms-auto">
            <span className="fs-16 fw-600">{formatAmount(opsAmount, 2, 2)}</span>
            <span className="text-gray-dark ms-1">FIL</span>
          </span>
        </p>
        <p className="d-flex my-3 gap-3">
          <span className="text-gray-dark">封裝算力</span>
          <span className="ms-auto">
            <span className="fs-16 fw-600">{formatPower(opsSealsPower)?.[0]}</span>
            <span className="text-gray-dark ms-1">{formatPower(opsSealsPower)?.[1]}</span>
          </span>
        </p>
        <p className="d-flex my-3 gap-3">
          <span className="text-gray-dark">
            <span className="me-1">我的算力</span>

            <Tooltip title={`我的算力 = 封裝算力 * ${priorityRate}%`}>
              <span className="bi bi-question-circle"></span>
            </Tooltip>
          </span>
          <span className="ms-auto">
            <span className="fs-16 fw-600">{formatPower(opsPower)?.[0]}</span>
            <span className="text-gray-dark ms-1">{formatPower(opsPower)?.[1]}</span>
          </span>
        </p>
        <p className="d-flex my-3 gap-3">
          <span className="text-gray-dark">可提餘額</span>
          <span className="ms-auto">
            <span className="fs-16 fw-600">0</span>
            <span className="text-gray-dark ms-1">FIL</span>
          </span>
        </p>
      </div>
    </>
  );
}
