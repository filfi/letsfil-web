import { Tooltip } from 'antd';
import { useMemo } from 'react';
import { parseEther } from 'viem';
import { useBalance } from 'wagmi';
import { useIntl } from '@umijs/max';
import { useRequest, useTitle } from 'ahooks';

import useAFIL from '@/hooks/useAFIL';
import { accMul } from '@/utils/utils';
import Dialog from '@/components/Dialog';
import Pledge from './components/Pledge';
import Redeem from './components/Redeem';
import { getLoanRate } from '@/apis/loan';
import SpinBtn from '@/components/SpinBtn';
import useAccount from '@/hooks/useAccount';
import useLoanPool from '@/hooks/useLoanPool';
import useProcessify from '@/hooks/useProcessify';
import { ADDR_LOAN, SCAN_URL } from '@/constants';
import useLoanContract from '@/hooks/useLoanContract';
import { formatAmount, formatRate, toFixed, toNumber } from '@/utils/format';

const fmtRate = (val: number | string) => {
  return formatRate(val, '0.0%').replace(/%$/, '');
};

export default function Stake() {
  const { formatMessage } = useIntl();
  useTitle(`${formatMessage({ id: 'menu.stake' })} - FilFi`, { restoreOnUnmount: true });

  const afil = useAFIL();
  const pool = useLoanPool();
  const contract = useLoanContract();
  const { data: rate } = useRequest(getLoanRate);
  const { address, connected, connecting, connect } = useAccount();
  const { data: balance } = useBalance({ address, watch: true, staleTime: 180_000 });

  const factor = useMemo(() => toFixed(pool.factor, 8), [pool.factor]);
  const loanRate = useMemo(() => toNumber(rate?.rate ?? '0', 6), [rate]);
  const fil = useMemo(() => accMul(afil.amount, pool.rate), [pool.rate, afil.amount]);

  const onConnect = () => {
    connect();
  };

  const refresh = async () => {
    await pool.refetch();
    await afil.refetch();
  };

  const [pledging, handlePledge] = useProcessify(async (amount: string) => {
    const fil = Number(amount);
    await contract.loanDeposit({ value: parseEther(`${fil}`) });

    refresh();
  });

  const [redeeming, handleRedeem] = useProcessify(async (amount: string) => {
    const afil = Number(amount);
    const fil = accMul(afil, pool.rate);

    if (fil > pool.shifting) {
      Dialog.error({
        title: '建設池內可用流動性不足',
        summary: '取回值超過建設池內可用金額',
        confirmBtnVariant: 'danger',
        confirmText: '知道了',
      });

      throw new Error('取回值超過建設池內可用金額');
    }

    await contract.loanWithdraw(parseEther(`${afil}`));

    refresh();
  });

  return (
    <div className="ffi-stake">
      <div className="container stake-container py-5">
        <div className="card stake-card card-body mb-4">
          <h4 className="card-title">建設池</h4>
          <p className="mb-4 text-gray">從建設池借貸的Fil全部定向用於節點建設，FilFi協定提供的安全保障</p>

          <div className="d-flex flex-wrap justify-content-between gap-4">
            <div className="text-gray">
              <p className="mb-1 fw-500">我的資產</p>
              <p className="mb-0">
                {connected ? (
                  <span className="fs-24 text-primary">{formatAmount(afil.amount)}</span>
                ) : (
                  <span className="fs-24 text-primary">--</span>
                )}
                <span className="fs-sm ms-1">aFIL</span>
              </p>
            </div>
            <div className="text-gray">
              <p className="mb-1 fw-500">贖回價值</p>
              <p className="mb-0">
                {connected ? <span className="fs-24">{formatAmount(fil, 0)}</span> : <span className="fs-24">--</span>}
                <span className="fs-sm ms-1">FIL</span>
              </p>
            </div>
            <div className="text-gray">
              <p className="mb-1 fw-500">
                <span className="me-1">7日年化</span>
                <Tooltip title="7日年化">
                  <span className="bi bi-info-circle-fill fs-sm"></span>
                </Tooltip>
              </p>
              <p className="mb-0">
                <span className="fs-24 text-success">{fmtRate(loanRate)}</span>
                <span className="fs-sm ms-1">%</span>
              </p>
            </div>
          </div>
        </div>

        <div className="card stake-card mb-4">
          {connected ? (
            <>
              <div className="card-header">
                <ul className="nav nav-tabs card-header-tabs nav-justified gap-3" role="tablist">
                  <li className="nav-item" role="presentation">
                    <a className="nav-link active" aria-current="page" href="#pledge" role="tab" data-bs-toggle="tab">
                      質押
                    </a>
                  </li>
                  <li className="nav-item" role="presentation">
                    <a className="nav-link" href="#redeem" role="tab" data-bs-toggle="tab">
                      取回
                    </a>
                  </li>
                </ul>
              </div>
              <div className="tab-content">
                <div id="pledge" className="tab-pane fade card-body show active" role="tabpanel">
                  <Pledge
                    balance={toNumber(balance?.value)}
                    rate={pool.rate}
                    loading={pledging}
                    disabled={redeeming}
                    onConfirm={handlePledge}
                  />
                </div>
                <div id="redeem" className="tab-pane fade card-body" role="tabpanel">
                  <Redeem
                    balance={afil.amount}
                    rate={pool.rate}
                    loading={redeeming}
                    disabled={pledging}
                    onConfirm={handleRedeem}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="card-header">
                <ul className="nav nav-tabs card-header-tabs nav-justified gap-3">
                  <li className="nav-item">
                    <a className="nav-link disabled">質押</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link disabled">取回</a>
                  </li>
                </ul>
              </div>
              <div className="card-body">
                <Pledge disabled hidden />
                <SpinBtn className="btn btn-primary btn-lg w-100" loading={connecting} onClick={onConnect}>
                  連接錢包
                </SpinBtn>
              </div>
            </>
          )}
        </div>

        <div className="card stake-card card-body mb-4">
          <p className="d-flex justify-content-between gap-4 mb-3">
            <span className="text-gray">目前兌換率</span>
            <span className="fw-500">
              {pool.isLoading ? <span>-</span> : <span>1 aFIL = {formatAmount(pool.rate)} FIL</span>}
            </span>
          </p>
          <p className="d-flex justify-content-between gap-4 mb-3">
            <span className="text-gray">可用流動性</span>
            <span className="fw-500">
              {pool.isLoading ? <span>-</span> : <span>{formatAmount(pool.shifting)} FIL</span>}
            </span>
          </p>
          <p className="d-flex justify-content-between gap-4 mb-3">
            <span className="text-gray">池子的利用率</span>
            <span className="fw-500">
              {pool.isLoading ? <span>-</span> : <span>{formatRate(factor, '0.0 %')}</span>}
            </span>
          </p>
          <p className="d-flex justify-content-between gap-4 mb-3">
            <span className="text-gray">可貸數量</span>
            <span className="fw-500">
              {pool.isLoading ? <span>-</span> : <span>{formatAmount(pool.available, 0)} FIL</span>}
            </span>
          </p>
          <p className="d-flex justify-content-between gap-4 mb-0">
            <span className="text-gray">智能合約</span>
            <a href={`${SCAN_URL}/address/${ADDR_LOAN}`} target="_blank" rel="noreferrer">
              瀏覽器查看
            </a>
          </p>
        </div>

        <div className="card stake-card card-body mb-4">
          <h4 className="card-title">FAQ</h4>
          <p className="text-gray">XXX</p>
        </div>
      </div>
    </div>
  );
}
