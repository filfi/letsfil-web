import { useMemo } from 'react';
import { Link } from '@umijs/max';
import { parseEther } from 'viem';

import * as H from '@/helpers/app';
import MountBack from './MountBack';
import Modal from '@/components/Modal';
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
      <div id="card-action" className="card section-card">
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
                  主办人已签名
                </SpinBtn>
              </p>
              <p>等待其他人完成签名</p>
            </>
          ) : (
            <>
              <p className="mb-3">
                <SpinBtn className="btn btn-primary btn-lg w-100" loading={signing} onClick={handleSign}>
                  主办人签名
                </SpinBtn>
              </p>
              <p>与相关方共识后签名，链上部署后不可修改。</p>
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
      <div id="card-action" className="card section-card">
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
                  技术服务商已签名
                </SpinBtn>
              </p>
              <p>等待其他人完成签名</p>
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
                  技术服务商签名
                </SpinBtn>
              </p>
              <p>{isSponsorSigned ? '确认计划内容，移交节点Owner权限给FilFi智能合约' : '等待所有主办人完成签名'}</p>
            </>
          )}
        </div>
      </div>

      <Modal.Alert id="signer-confirm" footerClassName="border-0" title="移交Owner地址" confirmText="签名" confirmLoading={signing} onConfirm={handleSign}>
        <div className="p-3">
          <p className="mb-0 fs-16 fw-500">
            <span>在安全环境下执行以下命令，将Owner地址修改为智能合约地址。</span>
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
              <ShareBtn className="btn p-0" text={`lotus-miner actor set-owner --really-do-it ${toF4Address(data.raise_address)} <ownerAddress>`}>
                <IconCopy />
              </ShareBtn>
            </div>
          </div>

          <p className="mb-0 fs-16 fw-500">执行成功后点击“签名”按钮。</p>
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
      <div id="card-action" className="card section-card">
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

          <h4 className="card-title fw-normal mb-0">我的质押</h4>
          <p className="mb-3">
            <span className="fs-30 fw-bold text-main">{formatAmount(investorPledge)}</span>
            <span className="ms-1">FIL</span>
          </p>

          {isSigned ? (
            <>
              <p className="mb-3">
                <SpinBtn className="btn btn-primary btn-lg w-100" disabled>
                  已签名
                </SpinBtn>
              </p>
              <p>等待其他人完成签名</p>
            </>
          ) : (
            <>
              <p className="mb-3">
                <SpinBtn className="btn btn-primary btn-lg w-100" loading={signing} disabled={!isOtherSigned} onClick={handleSign}>
                  签名
                </SpinBtn>
              </p>
              <p>{isOtherSigned ? '确认自己的权益后签名，签名后上链不可更改。' : '等待主办人和技术服务商签名'}</p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

const CardMount: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { reward } = useRaiseReward(data);
  const { runningDays } = useRaiseSeals(data);
  const { data: counter } = useInvestorCount(data);
  const { isInactive, isWorking } = useMountState(data);
  const { sponsor, servicer, investor } = useMountAssets(data);

  if (!data) return null;

  if (isClosed(data)) {
    return (
      <div className="card section-card">
        <div className="card-header d-flex align-items-center border-0">
          <h4 className="card-title fw-bold mb-0 me-2">计划已关闭</h4>

          <span className="badge badge-danger ms-auto">分配计划已关闭</span>
        </div>
      </div>
    );
  }

  // 运行中
  if (isWorking) {
    return (
      <>
        <div className="card section-card">
          <div className="card-header border-0">
            <h4 className="card-title fw-bold mb-0">{data?.miner_id}已挂载到FilFi网络</h4>
          </div>
          <div className="card-body py-2">
            <p className="d-flex align-items-center gap-3 mb-2">
              <span>累计激励</span>
              <span className="ms-auto">
                <span className="fs-20 fw-600">{formatAmount(reward)}</span>
                <span className="ms-1 text-neutral">FIL</span>
              </span>
            </p>
            <p className="d-flex align-items-center gap-3 mb-2">
              <span>分配给</span>
              <span className="ms-auto">
                <span className="fs-20 fw-600">{counter?.investor_count ?? '-'}</span>
                <span className="ms-1 text-neutral">地址</span>
              </span>
            </p>
            <p className="d-flex align-items-center gap-3 mb-2">
              <span>已运行</span>
              <span className="ms-auto">
                <span className="fs-20 fw-600">{runningDays}</span>
                <span className="ms-1 text-neutral">天</span>
              </span>
            </p>

            {!!(sponsor || servicer || investor) && (
              <p className="mt-3">
                <Link className="btn btn-primary btn-lg w-100" to={`/assets/${data?.raising_id ?? ''}`}>
                  查看我的算力资产
                </Link>
              </p>
            )}
          </div>
        </div>

        <MountBack data={data} />
      </>
    );
  }

  if (isInactive) {
    if (sponsor && sponsor.role_level === 1) {
      return <SponsorCard data={data} />;
    }

    return (
      <div className="card section-card">
        <div className="card-header border-0">
          <h4 className="card-title fw-bold mb-0">分配计划还未上链</h4>
        </div>
        <div className="card-body">
          <p className="mb-0">正在共识中，等待主办人签名上链。</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!!sponsor && <SponsorCard data={data} />}

      {!!servicer && <ServicerCard data={data} />}

      {!!investor && <InvestorCard data={data} />}
    </>
  );
};

export default CardMount;
