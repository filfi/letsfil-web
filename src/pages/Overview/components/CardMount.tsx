import { useMemo } from 'react';
import { parseEther } from 'viem';
import { Link, useModel } from '@umijs/max';

import * as H from '@/helpers/app';
import MountBack from './MountBack';
import Modal from '@/components/Modal';
import CardLending from './CardLending';
import { isClosed } from '@/helpers/raise';
import SpinBtn from '@/components/SpinBtn';
import ShareBtn from '@/components/ShareBtn';
import useAccount from '@/hooks/useAccount';
import useContract from '@/hooks/useContract';
import useProcessify from '@/hooks/useProcessify';
import useMountState from '@/hooks/useMountState';
import useRaiseSeals from '@/hooks/useRaiseSeals';
import useMountAssets from '@/hooks/useMountAssets';
import useRaiseReward from '@/hooks/useRaiseReward';
import useInvestorCount from '@/hooks/useInvestorCount';
import { isEqual, toF4Address } from '@/utils/utils';
import { formatAmount, formatPower } from '@/utils/format';
import { ReactComponent as IconCopy } from '@/assets/icons/copy-light.svg';

const SponsorCard: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { address } = useAccount();
  const { mountNode, sponsorSign } = useContract(data?.raise_address);

  const { sponsors, investors, pledge, sponsorRate, sponsorPower } = useMountAssets(data);
  const sponsor = useMemo(() => sponsors?.find((i) => isEqual(i.address, address)), [address]);

  const isSigned = useMemo(() => Boolean(sponsor?.sign_status), [sponsor]);

  const handleCreate = async () => {
    if (!data || !Array.isArray(sponsors) || !Array.isArray(investors)) return;

    const raise = H.transformRaiseInfo(data);
    const node = H.transformNodeInfo(data);
    const _sponsors = sponsors.map((i) => i.address);
    const sponsorRates = sponsors.map((i) => Number(i.power_proportion));
    const _investors = investors.map((i) => i.address);
    const investorPledges = investors.map((i) => i.pledge_amount);
    const investorRates = investors.map((i) => +i.power_proportion);
    const _pledge = parseEther(`${pledge}`).toString();

    await mountNode(raise, node, _sponsors, sponsorRates, _investors, investorPledges, investorRates, _pledge);
  };

  const [signing, handleSign] = useProcessify(async () => {
    if (!data || !sponsor) return;

    if (sponsor.role_level === 1) {
      await handleCreate();
      return;
    }

    if (sponsor.role_level === 2) {
      await sponsorSign(data.raising_id);
    }
  });

  if (!sponsor) return null;

  return (
    <>
      <div id="card-action" className="card section-card sticky-card">
        <div className="card-body pt-4">
          <h4 className="card-title fw-normal mb-0">我的分配比例</h4>
          <p className="mb-3">
            <span className="fs-30 fw-bold text-main">{sponsorRate}</span>
            <span className="ms-1">%</span>
          </p>

          <h4 className="card-title fw-normal mb-0">我的算力</h4>
          <p className="mb-3">
            <span className="fs-30 fw-bold text-main">{formatPower(sponsorPower)?.[0]}</span>
            <span className="ms-1">{formatPower(sponsorPower)?.[1]}</span>
          </p>

          {isSigned ? (
            <>
              <p className="mb-3">
                <SpinBtn className="btn btn-primary btn-lg w-100" disabled>
                  主辦人已簽名
                </SpinBtn>
              </p>
              <p>等待其他人完成簽名</p>
            </>
          ) : (
            <>
              <p className="mb-3">
                <SpinBtn className="btn btn-primary btn-lg w-100" loading={signing} onClick={handleSign}>
                  主辦人簽名
                </SpinBtn>
              </p>
              <p>與相關方共識後簽名，鏈上部署後不可修改。</p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

const ServicerCard: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { servicerSign } = useContract(data?.raise_address);

  const { servicer, sponsors, servicerRate, servicerPower } = useMountAssets(data);

  const isSigned = useMemo(() => Boolean(servicer?.sign_status), [servicer]);
  const isSponsorSigned = useMemo(() => sponsors?.every((i) => Boolean(i.sign_status)), [sponsors]);

  const [signing, handleSign] = useProcessify(async () => {
    if (!data) return;

    await servicerSign();
  });

  if (!data) return null;

  return (
    <>
      <div id="card-action" className="card section-card sticky-card">
        <div className="card-body pt-4">
          <h4 className="card-title fw-normal mb-0">我的分配比例</h4>
          <p className="mb-3">
            <span className="fs-30 fw-bold text-main">{servicerRate}</span>
            <span className="ms-1">%</span>
          </p>

          <h4 className="card-title fw-normal mb-0">我的算力</h4>
          <p className="mb-3">
            <span className="fs-30 fw-bold text-main">{formatPower(servicerPower)?.[0]}</span>
            <span className="ms-1">{formatPower(servicerPower)?.[1]}</span>
          </p>

          {isSigned ? (
            <>
              <p className="mb-3">
                <SpinBtn className="btn btn-primary btn-lg w-100" disabled>
                  技術服務商已簽名
                </SpinBtn>
              </p>
              <p>等待其他人完成簽名</p>
            </>
          ) : (
            <>
              <p className="mb-3">
                <SpinBtn
                  className="btn btn-primary btn-lg w-100"
                  loading={signing}
                  disabled={!isSponsorSigned}
                  data-bs-toggle="modal"
                  data-bs-target="#signer-confirm"
                >
                  技術服務商簽名
                </SpinBtn>
              </p>
              <p>{isSponsorSigned ? '確認計畫內容，移交節點Owner權限給FilFi智能合約' : '等待所有主辦人完成簽名'}</p>
            </>
          )}
        </div>
      </div>

      <Modal.Alert
        id="signer-confirm"
        footerClassName="border-0"
        title="移交Owner地址"
        confirmText="簽名"
        confirmLoading={signing}
        onConfirm={handleSign}
      >
        <div className="p-3">
          <p className="mb-0 fs-16 fw-500">
            <span>在安全環境下執行以下命令，將Owner位址修改為智慧合約位址。</span>
            {/* <a className="text-underline" href="#">
              如何收回Owner地址？
            </a> */}
          </p>

          <div className="p-2 border rounded-1 my-4">
            <div className="d-flex align-items-start bg-dark rounded-1 p-2">
              <span className="flex-shrink-0 text-white fw-600">$</span>
              <div className="flex-grow-1 mx-2 fw-600 text-wrap text-success">
                lotus-miner actor set-owner --really-do-it {toF4Address(data.raise_address)} &lt;ownerAddress&gt;
              </div>
              <ShareBtn
                className="btn p-0"
                text={`lotus-miner actor set-owner --really-do-it ${toF4Address(data.raise_address)} <ownerAddress>`}
              >
                <IconCopy />
              </ShareBtn>
            </div>
          </div>

          <p className="mb-0 fs-16 fw-500">執行成功後點選“簽名”按鈕。</p>
        </div>
      </Modal.Alert>
    </>
  );
};

const InvestorCard: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { investorSign } = useContract(data?.raise_address);

  const { sponsors = [], servicers = [], investor, investorRate, investorPledge, investorPower } = useMountAssets(data);

  const isSigned = useMemo(() => Boolean(investor?.sign_status), [investor]);
  const isOtherSigned = useMemo(() => [...sponsors, ...servicers].every((i) => Boolean(i.sign_status)), [sponsors]);

  const [signing, handleSign] = useProcessify(async () => {
    if (!data) return;

    await investorSign(data.raising_id);
  });

  return (
    <>
      <div id="card-action" className="card section-card sticky-card">
        <div className="card-body">
          <h4 className="card-title fw-normal mb-0">我的分配比例</h4>
          <p className="mb-3">
            <span className="fs-30 fw-bold text-main">{investorRate}</span>
            <span className="ms-1">%</span>
          </p>

          <h4 className="card-title fw-normal mb-0">我的算力</h4>
          <p className="mb-3">
            <span className="fs-30 fw-bold text-main">{formatPower(investorPower)?.[0]}</span>
            <span className="ms-1">{formatPower(investorPower)?.[1]}</span>
          </p>

          <h4 className="card-title fw-normal mb-0">我的質押</h4>
          <p className="mb-3">
            <span className="fs-30 fw-bold text-main">{formatAmount(investorPledge)}</span>
            <span className="ms-1">FIL</span>
          </p>

          {isSigned ? (
            <>
              <p className="mb-3">
                <SpinBtn className="btn btn-primary btn-lg w-100" disabled>
                  已簽名
                </SpinBtn>
              </p>
              <p>等待其他人完成簽名</p>
            </>
          ) : (
            <>
              <p className="mb-3">
                <SpinBtn
                  className="btn btn-primary btn-lg w-100"
                  loading={signing}
                  disabled={!isOtherSigned}
                  onClick={handleSign}
                >
                  簽名
                </SpinBtn>
              </p>
              <p>{isOtherSigned ? '確認自己的權益後簽名，簽名後上鍊不可更改。' : '等待主辦人和技術服務商簽名'}</p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

const CardMount: React.FC = () => {
  const { plan } = useModel('Overview.overview');

  const { reward } = useRaiseReward(plan);
  const { runningDays } = useRaiseSeals(plan);
  const { data: counter } = useInvestorCount(plan);
  const { isInactive, isWorking } = useMountState(plan);
  const { sponsor, servicer, investor } = useMountAssets(plan);

  if (!plan) return null;

  if (isClosed(plan)) {
    return (
      <div className="card section-card sticky-card">
        <div className="card-header d-flex align-items-center border-0">
          <h4 className="card-title fw-bold mb-0 me-2">計劃已關閉</h4>

          <span className="badge badge-danger ms-auto">分配計劃已關閉</span>
        </div>
      </div>
    );
  }

  // 运行中
  if (isWorking) {
    return (
      <>
        <div className="card section-card sticky-card">
          <div className="card-header border-0">
            <h4 className="card-title fw-bold mb-0">{plan?.miner_id}已掛載到FilFi網絡</h4>
          </div>
          <div className="card-body py-2">
            <p className="d-flex align-items-center gap-3 mb-2">
              <span>累計激勵</span>
              <span className="ms-auto">
                <span className="fs-20 fw-600">{formatAmount(reward)}</span>
                <span className="ms-1 text-neutral">FIL</span>
              </span>
            </p>
            <p className="d-flex align-items-center gap-3 mb-2">
              <span>分配給</span>
              <span className="ms-auto">
                <span className="fs-20 fw-600">{counter?.investor_count ?? '-'}</span>
                <span className="ms-1 text-neutral">地址</span>
              </span>
            </p>
            <p className="d-flex align-items-center gap-3 mb-2">
              <span>已運行</span>
              <span className="ms-auto">
                <span className="fs-20 fw-600">{runningDays}</span>
                <span className="ms-1 text-neutral">天</span>
              </span>
            </p>

            {!!(sponsor || servicer || investor) && (
              <p className="mt-3">
                <Link className="btn btn-primary btn-lg w-100" to={`/assets/overview/${plan?.raising_id ?? ''}`}>
                  查看我的算力資產
                </Link>
              </p>
            )}
          </div>
        </div>

        <MountBack />

        <CardLending />
      </>
    );
  }

  if (isInactive) {
    if (sponsor && sponsor.role_level === 1) {
      return <SponsorCard data={plan} />;
    }

    return (
      <div className="card section-card sticky-card">
        <div className="card-header border-0">
          <h4 className="card-title fw-bold mb-0">分配計劃尚未上鏈</h4>
        </div>
        <div className="card-body">
          <p className="mb-0">正在共識中，等待主辦人簽名上鍊。</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!!sponsor && <SponsorCard data={plan} />}

      {!!servicer && <ServicerCard data={plan} />}

      {!!investor && <InvestorCard data={plan} />}

      <CardLending />
    </>
  );
};

export default CardMount;
