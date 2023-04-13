import { formatEther } from '@/utils/format';

const Assets: React.FC<{
  amount?: number | string;
  data?: API.Base;
}> = ({ amount }) => {
  return (
    <>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">我的资产</h5>
          <p className="mb-4">在此计划中的权益</p>

          <div className="row row-cols-2">
            <div className="col">
              <p className="mb-2 fw-500">FIL奖励的权益</p>
              <p className="mb-0 text-main">
                <span className="decimal me-2">0%</span>
                <span className="unit text-neutral">FIL</span>
              </p>
            </div>
            <div className="col">
              <p className="mb-2 fw-500">质押币的权益</p>
              <p className="mb-0 text-main">
                <span className="decimal me-2">{formatEther(amount)}</span>
                <span className="unit text-neutral">FIL</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Assets;
