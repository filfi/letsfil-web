import useAssetPack from '@/hooks/useAssetPack';
import useRewardServicer from '@/hooks/useRewardServicer';
import { formatAmount, formatPower } from '@/utils/format';

export type ItemProps = {
  pack: API.Pack;
  plan?: API.Plan | null;
};

export default function ServicerCard({ pack, plan }: React.PropsWithChildren<ItemProps>) {
  const { reward } = useRewardServicer(plan);
  const { opsFeePower } = useAssetPack(plan, pack);

  return (
    <>
      <p className="d-flex my-3 gap-3">
        <span className="text-gray-dark">质押</span>
        <span className="ms-auto">
          <span className="fs-16 fw-600">0</span>
          <span className="text-gray-dark ms-1">FIL</span>
        </span>
      </p>
      <p className="d-flex my-3 gap-3">
        <span className="text-gray-dark">权益算力</span>
        <span className="ms-auto">
          <span className="fs-16 fw-600">{formatPower(opsFeePower)?.[0]}</span>
          <span className="text-gray-dark ms-1">{formatPower(opsFeePower)?.[1]}</span>
        </span>
      </p>
      <p className="d-flex my-3 gap-3">
        <span className="text-gray-dark">可提余额</span>
        <span className="ms-auto">
          <span className="fs-16 fw-600">{formatAmount(reward)}</span>
          <span className="text-gray-dark ms-1">FIL</span>
        </span>
      </p>
    </>
  );
}
