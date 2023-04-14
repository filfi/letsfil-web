import { useMemo } from 'react';
import { history } from '@umijs/max';

import { formatRate } from '@/utils/format';
import useAuthHandler from '@/hooks/useAuthHandler';
import useDepositInvest from '@/hooks/useDepositInvest';
import { ReactComponent as FilIcon } from '@/assets/icons/filecoin-light.svg';

const Staking: React.FC<{ data?: API.Base }> = ({ data }) => {
  const { amount, totalPledge } = useDepositInvest(data?.raise_address);

  const raiseId = useMemo(() => data?.raising_id ?? '', [data]);
  const percent = useMemo(() => (totalPledge > 0 ? amount / totalPledge : 0), [amount, totalPledge]);

  const goStaking = useAuthHandler(() => {
    history.push(`/letsfil/staking/${raiseId}`);
  });

  return (
    <>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">参与计划</h5>
          {amount > 0 ? (
            <>
              <p>
                已投入{amount}FIL，占比{formatRate(percent)}
              </p>

              <button type="button" className="btn btn-primary btn-lg w-100" onClick={goStaking}>
                <FilIcon />
                <span className="ms-2 align-middle">追加质押</span>
              </button>
            </>
          ) : (
            <>
              <p>转入FIL参与此计划的质押</p>

              <button type="button" className="btn btn-primary btn-lg w-100" onClick={goStaking}>
                <FilIcon />
                <span className="ms-2 align-middle">质押FIL</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Staking;
