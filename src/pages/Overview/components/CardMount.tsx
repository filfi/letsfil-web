import { useMemo } from 'react';
import { parseUnits } from 'viem';
import { Link } from '@umijs/max';

import * as H from '@/helpers/app';
import Modal from '@/components/Modal';
import SpinBtn from '@/components/SpinBtn';
import ShareBtn from '@/components/ShareBtn';
import useAccount from '@/hooks/useAccount';
import useContract from '@/hooks/useContract';
import useMinerInfo from '@/hooks/useMinerInfo';
import useRaiseRate from '@/hooks/useRaiseRate';
import useRaiseRole from '@/hooks/useRaiseRole';
import useProcessify from '@/hooks/useProcessify';
import useMountState from '@/hooks/useMountState';
import useRaiseSeals from '@/hooks/useRaiseSeals';
import useMountEquity from '@/hooks/useMountEquity';
import useRaiseReward from '@/hooks/useRaiseReward';
import useInvestorCount from '@/hooks/useInvestorCount';
import useDepositInvestor from '@/hooks/useDepositInvestor';
import { formatAmount, formatPower, toNumber } from '@/utils/format';
import { accDiv, accMul, isEqual, toF4Address } from '@/utils/utils';
import { ReactComponent as IconCopy } from '@/assets/icons/copy-light.svg';

const RaiserCard: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { address } = useAccount();
  const { isStarted } = useMountState(data);
  const { raiserRate } = useRaiseRate(data);
  const { data: info } = useMinerInfo(data?.miner_id);
  const { data: investors } = useMountEquity(data);
  const { mountNode } = useContract(data?.raise_address);

  const power = useMemo(() => +`${info?.miner_power || '0'}`, [info?.miner_power]);
  const iPower = useMemo(() => accMul(power, accDiv(raiserRate, 100)), [power, raiserRate]);

  const [creating, handleCreate] = useProcessify(async () => {
    if (!data || !Array.isArray(investors)) return;

    const raise = H.transformRaiseInfo(data);
    const node = H.transformNodeInfo(data);
    const sponsors = [address] as string[];
    const sponsorRates = [Number(parseUnits(`${raiserRate}`, 5))];
    const _investors = investors.map((i) => i.address);
    const investorPledges = investors.map((i) => i.pledge_amount);
    const investorRates = investors.map((i) => +i.power_proportion);

    await mountNode(raise, node, sponsors, sponsorRates, _investors, investorPledges, investorRates);
  });

  return (
    <>
      <div id="card-action" className="card section-card">
        <div className="card-body pt-4">
          <h4 className="card-title fw-normal mb-0">我的分配比例</h4>
          <p className="mb-3">
            <span className="fs-30 fw-bold text-main">{raiserRate}</span>
            <span className="ms-1">%</span>
          </p>

          <h4 className="card-title fw-normal mb-0">我的算力</h4>
          <p className="mb-3">
            <span className="fs-30 fw-bold text-main">{formatPower(iPower)?.[0]}</span>
            <span className="ms-1">{formatPower(iPower)?.[1]}</span>
          </p>

          <p className="mb-3">
            <SpinBtn className="btn btn-primary btn-lg w-100" loading={creating} disabled={isStarted} onClick={handleCreate}>
              {isStarted ? '主办人已签名' : '主办人签名'}
            </SpinBtn>
          </p>
          <p>与相关方共识后签名，链上部署后不可修改。</p>
        </div>
      </div>
    </>
  );
};

const ServicerCard: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { isSigned } = useRaiseRole(data);
  const { servicerRate } = useRaiseRate(data);
  const { data: info } = useMinerInfo(data?.miner_id);
  const { data: investors } = useMountEquity(data);
  const { servicerSign } = useContract(data?.raise_address);

  const signed = useMemo(() => investors?.every((i) => i.sign_status), [investors]);
  const power = useMemo(() => +`${info?.miner_power || '0'}`, [info?.miner_power]);
  const iPower = useMemo(() => accMul(power, accDiv(servicerRate, 100)), [power, servicerRate]);

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
            <span className="fs-30 fw-bold text-main">{formatPower(iPower)?.[0]}</span>
            <span className="ms-1">{formatPower(iPower)?.[1]}</span>
          </p>

          <p className="mb-3">
            <SpinBtn
              className="btn btn-primary btn-lg w-100"
              loading={signing}
              disabled={!signed || isSigned}
              data-bs-toggle="modal"
              data-bs-target="#signer-confirm"
            >
              {isSigned ? '技术服务商已签名' : '技术服务商签名'}
            </SpinBtn>
          </p>
          <p>等待其他所有人完成签名</p>
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
  const { address } = useAccount();
  const { data: items } = useMountEquity(data);
  const { data: info } = useMinerInfo(data?.miner_id);
  const { investorSign } = useContract(data?.raise_address);

  const investor = useMemo(() => items?.find((item) => isEqual(item.address, address)), [address, items]);
  const rate = useMemo(() => toNumber(investor?.power_proportion, 5), [investor]);
  const power = useMemo(() => +`${info?.miner_power || '0'}`, [info?.miner_power]);
  const pledge = useMemo(() => toNumber(info?.initial_pledge), [info?.initial_pledge]);
  const isSigned = useMemo(() => !!investor?.sign_status, [investor]);

  const iPower = useMemo(() => accMul(power, accDiv(rate, 100)), [power, rate]);
  const iPledge = useMemo(() => accMul(pledge, accDiv(rate, 100)), [pledge, rate]);

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
            <span className="fs-30 fw-bold text-main">{rate}</span>
            <span className="ms-1">%</span>
          </p>

          <h4 className="card-title fw-normal mb-0">我的算力</h4>
          <p className="mb-3">
            <span className="fs-30 fw-bold text-main">{formatPower(iPower)?.[0]}</span>
            <span className="ms-1">{formatPower(iPower)?.[1]}</span>
          </p>

          <h4 className="card-title fw-normal mb-0">我的质押</h4>
          <p className="mb-3">
            <span className="fs-30 fw-bold">{formatAmount(iPledge)}</span>
            <span className="ms-1">FIL</span>
          </p>

          <p className="mb-3">
            <SpinBtn className="btn btn-primary btn-lg w-100" loading={signing} disabled={isSigned} onClick={handleSign}>
              {isSigned ? '已签名' : '签名'}
            </SpinBtn>
          </p>
          <p>确认自己的权益后签名，签名后上链不可更改。</p>
        </div>
      </div>
    </>
  );
};

const CardMount: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { reward } = useRaiseReward(data);
  const { runningDays } = useRaiseSeals(data);
  const { isInvestor } = useDepositInvestor(data);
  const { data: counter } = useInvestorCount(data);
  const { isRaiser, isServicer } = useRaiseRole(data);
  const { isInactive, isWorking } = useMountState(data);

  if (!data) return null;

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

            <p className="mt-3 mb-0">
              <Link className="btn btn-primary btn-lg w-100" to={`/assets/${data?.raising_id ?? ''}`}>
                查看我的算力资产
              </Link>
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isInactive && (
        <div className="card section-card">
          <div className="card-header border-0">
            <h4 className="card-title fw-bold mb-0">分配计划还未上链</h4>
          </div>
          <div className="card-body">
            <p className="mb-0">正在共识中，等待主办人签名上链。</p>
          </div>
        </div>
      )}

      {isRaiser && <RaiserCard data={data} />}

      {isServicer && <ServicerCard data={data} />}

      {isInvestor && <InvestorCard data={data} />}
    </>
  );
};

export default CardMount;
