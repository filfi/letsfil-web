import { useMemo } from 'react';
import { history } from '@umijs/max';

// import SpinBtn from '@/components/SpinBtn';
import { formatRate } from '@/utils/format';
import useAuthHandler from '@/hooks/useAuthHandler';
import { ReactComponent as FilIcon } from '@/assets/icons/filecoin-light.svg';
// import { ReactComponent as ArrowIcon } from '@/assets/icons/arrow-circle-broken-right.svg';

const Staking: React.FC<{
  amount?: number | string;
  total?: number | string;
  raiseID?: number | string;
  loading?: boolean;
  onConfirm?: () => void;
}> = ({ amount = 0, total = 0, raiseID }) => {
  const isInvest = useMemo(() => +(amount ?? 0) > 0, [amount]);
  const percent = useMemo(() => (+total > 0 ? +amount / +total : 0), [amount, total]);

  const link = useAuthHandler((path: string) => {
    history.push(path);
  });

  return (
    <>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">参与计划</h5>
          {isInvest ? (
            <>
              <p>
                已投入{amount}FIL，占比{formatRate(percent)}
              </p>

              {/* <div className="d-flex gap-3 flex-wrap">
                <SpinBtn className="btn btn-light btn-lg flex-fill" icon={<ArrowIcon />} loading={loading} onClick={onConfirm}>
                  {loading ? '正在赎回' : '赎回FIL'}
                </SpinBtn>

                <button type="button" className="btn btn-primary btn-lg flex-fill" onClick={() => link(`/letsfil/staking/${raiseID}`)}>
                  <FilIcon />
                  <span className="ms-2 align-middle">追加质押</span>
                </button>
              </div> */}
              <button type="button" className="btn btn-primary btn-lg w-100" onClick={() => link(`/letsfil/staking/${raiseID}`)}>
                <FilIcon />
                <span className="ms-2 align-middle">追加质押</span>
              </button>
            </>
          ) : (
            <>
              <p>转入FIL参与此计划的质押</p>

              <button type="button" className="btn btn-primary btn-lg w-100" onClick={() => link(`/letsfil/staking/${raiseID}`)}>
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
