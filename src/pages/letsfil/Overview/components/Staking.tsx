import { useMemo } from 'react';

import { Link } from '@umijs/max';
import { formatEther, formatRate } from '@/utils/format';
import { ReactComponent as FilIcon } from '@/assets/icons/filecoin-light.svg';
import { ReactComponent as ArrowIcon } from '@/assets/icons/arrow-circle-broken-right.svg';

const Staking: React.FC<{
  amount?: number | string;
  total?: number | string;
  raiseID?: number | string;
}> = ({ amount = 0, total = 0, raiseID }) => {
  const isInvest = useMemo(() => +(amount ?? 0) > 0, [amount]);
  const percent = useMemo(
    () => (+total > 0 ? +amount / +total : 0),
    [amount, total],
  );

  return (
    <>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">参与计划</h5>
          {isInvest ? (
            <>
              <p>
                已投入{formatEther(amount)}FIL，占比{formatRate(percent)}
              </p>

              <div className="d-flex gap-3">
                <Link
                  className="btn btn-light btn-lg flex-fill"
                  to={`/letsfil/redeem/${raiseID}`}
                >
                  <ArrowIcon />
                  <span className="ms-2 align-middle">赎回FIL</span>
                </Link>
                <Link
                  className="btn btn-primary btn-lg flex-fill"
                  to={`/letsfil/pledge/${raiseID}`}
                >
                  <FilIcon />
                  <span className="ms-2 align-middle">追加质押</span>
                </Link>
              </div>
            </>
          ) : (
            <>
              <p>转入FIL参与此计划的质押</p>

              <Link
                className="btn btn-primary btn-lg w-100"
                to={`/letsfil/pledge/${raiseID}`}
              >
                <FilIcon />
                <span className="ms-2 align-middle">质押FIL</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Staking;
