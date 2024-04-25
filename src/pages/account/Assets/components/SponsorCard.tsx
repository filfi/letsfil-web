import useAssetPack from '@/hooks/useAssetPack';
import useRewardSponsor from '@/hooks/useRewardSponsor';
import { formatAmount, formatPower } from '@/utils/format';

export type ItemProps = {
  pack: API.Pack;
  plan?: API.Plan | null;
};

export default function SponsorCard({ pack, plan }: React.PropsWithChildren<ItemProps>) {
  const { reward } = useRewardSponsor(plan);
  const { raiserPower } = useAssetPack(plan, pack);

  return (
    <>
      <div className="card-body py-1">
        <p className="d-flex my-3 gap-3">
          <span className="text-gray-dark">我的質押</span>
          <span className="ms-auto">
            <span className="fs-16 fw-600">0</span>
            <span className="text-gray-dark ms-1">FIL</span>
          </span>
        </p>
        <p className="d-flex my-3 gap-3">
          <span className="text-gray-dark">我的算力</span>
          <span className="ms-auto">
            <span className="fs-16 fw-600">{formatPower(raiserPower)?.[0]}</span>
            <span className="text-gray-dark ms-1">{formatPower(raiserPower)?.[1]}</span>
          </span>
        </p>
        <p className="d-flex my-3 gap-3">
          <span className="text-gray-dark">可提餘額</span>
          <span className="ms-auto">
            <span className="fs-16 fw-600">{formatAmount(reward)}</span>
            <span className="text-gray-dark ms-1">FIL</span>
          </span>
        </p>
      </div>
    </>
  );
}
