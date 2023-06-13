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
      <p className="d-flex my-3 gap-3">
        <span className="text-gray-dark">质押</span>
        <span className="ms-auto">
          <span className="fs-16 fw-600">{formatAmount(opsAmount, 2, 2)}</span>
          <span className="text-gray-dark ms-1">FIL</span>
        </span>
      </p>
      <p className="d-flex my-3 gap-3">
        <span className="text-gray-dark">封装算力</span>
        <span className="ms-auto">
          <span className="fs-16 fw-600">{formatPower(opsSealsPower)?.[0]}</span>
          <span className="text-gray-dark ms-1">{formatPower(opsSealsPower)?.[1]}</span>
        </span>
      </p>
      <p className="d-flex my-3 gap-3">
        <span className="text-gray-dark">权益算力(封装算力 * {priorityRate}%)</span>
        <span className="ms-auto">
          <span className="fs-16 fw-600">{formatPower(opsPower)?.[0]}</span>
          <span className="text-gray-dark ms-1">{formatPower(opsPower)?.[1]}</span>
        </span>
      </p>
      <p className="d-flex my-3 gap-3">
        <span className="text-gray-dark">可提余额</span>
        <span className="ms-auto">
          <span className="fs-16 fw-600">0</span>
          <span className="text-gray-dark ms-1">FIL</span>
        </span>
      </p>
    </>
  );
}
