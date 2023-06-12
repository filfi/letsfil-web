import { useMemo } from 'react';
import classNames from 'classnames';
import { ScrollSpy } from 'bootstrap';
import { NavLink, useParams } from '@umijs/max';
import { useResponsive, useUpdateEffect } from 'ahooks';

import styles from './styles.less';
import { SCAN_URL } from '@/constants';
import Dialog from '@/components/Dialog';
import SpinBtn from '@/components/SpinBtn';
import ShareBtn from '@/components/ShareBtn';
import PageHeader from '@/components/PageHeader';
import LoadingView from '@/components/LoadingView';
import useRaiseInfo from '@/hooks/useRaiseInfo';
import useRaiseRole from '@/hooks/useRaiseRole';
import useRaiseState from '@/hooks/useRaiseState';
import useRaiseActions from '@/hooks/useRaiseActions';
import { formatID, formatSponsor } from '@/utils/format';
import useDepositInvestor from '@/hooks/useDepositInvestor';
import CardBack from './components/CardBack';
import CardRaise from './components/CardRaise';
import CardAssets from './components/CardAssets';
import CardStaking from './components/CardStaking';
import SectionNode from './components/SectionNode';
import SectionRaise from './components/SectionRaise';
import SectionSeals from './components/SectionSeals';
import SectionEvents from './components/SectionEvents';
import SectionPledge from './components/SectionPledge';
import SectionReward from './components/SectionReward';
import SectionDeposit from './components/SectionDeposit';
import SectionContract from './components/SectionContract';
import SectionProvider from './components/SectionProvider';
import SectionTimeline from './components/SectionTimeline';
import { ReactComponent as IconEdit } from '@/assets/icons/edit-05.svg';
import { ReactComponent as IconTrash } from '@/assets/icons/trash-04.svg';
import { ReactComponent as IconShare4 } from '@/assets/icons/share-04.svg';
import { ReactComponent as IconShare6 } from '@/assets/icons/share-06.svg';

function updateScrollSpy() {
  const el = document.querySelector('[data-bs-spy="scroll"]');

  if (el) {
    const spy = ScrollSpy.getOrCreateInstance(el);

    spy.refresh();
  }
}

export default function Overview() {
  const param = useParams();
  const responsive = useResponsive();
  const { data, error, isLoading, refetch } = useRaiseInfo(param.id);

  const { isInvestor } = useDepositInvestor(data);
  const { isRaiser, isServicer } = useRaiseRole(data);
  const { isPending, isWaiting, isWorking, isRaising, isStarted, isSuccess } = useRaiseState(data);

  const actions = useRaiseActions(data);

  const title = useMemo(() => (data ? `${formatSponsor(data.sponsor_company)}发起的节点计划@${data.miner_id}` : '-'), [data]);
  const showAsset = useMemo(() => isWorking && (isInvestor || isRaiser || isServicer), [isInvestor, isRaiser, isServicer, isWorking]);

  useUpdateEffect(updateScrollSpy, [data, isStarted]);

  const handleEdit = () => {
    actions.edit();
  };

  const handleDelete = () => {
    const hide = Dialog.confirm({
      icon: 'delete',
      title: '删除节点计划',
      summary: '未签名的节点计划可以永久删除。',
      confirmLoading: actions.removing,
      onConfirm: () => {
        hide();

        actions.remove();
      },
    });
  };

  const handleClose = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();

    const hide = Dialog.confirm({
      icon: 'error',
      title: '关闭节点计划',
      summary: '节点计划已经部署在链上，关闭已经启动的节点计划被视为违约。',
      content: (
        <div className="text-gray">
          <ul>
            <li>需要向建设者支付投资额的利息</li>
            <li>需要向技术服务商支付保证金利息</li>
          </ul>
          <p>
            <span>智能合约按照规则会产生罚金，罚金从主办人保证金中扣除。 </span>
            <a href="#">如何计算罚金？</a>
          </p>
        </div>
      ),
      confirmBtnVariant: 'danger',
      confirmText: '关闭并支付罚金',
      confirmLoading: actions.closing,
      onConfirm: async () => {
        hide();

        await actions.close();
      },
    });
  };

  const renderActions = () => {
    if (!data) return null;

    return (
      <>
        {isPending && isRaiser && (
          <>
            <SpinBtn className="btn btn-primary" icon={<IconEdit />} disabled={actions.removing} onClick={handleEdit}>
              修改节点计划
            </SpinBtn>

            <SpinBtn className="btn btn-danger" icon={<IconTrash />} loading={actions.removing} onClick={handleDelete}>
              删除
            </SpinBtn>
          </>
        )}

        <ShareBtn className="btn btn-light" text={location.href} toast="链接已复制">
          <IconShare6 />
          <span className="align-middle ms-1">分享</span>
        </ShareBtn>

        {!isPending && (
          <a className="btn btn-light text-nowrap" href={`${SCAN_URL}/address/${data.raise_address}`} target="_blank" rel="noreferrer">
            <IconShare4 />
            <span className="align-middle ms-1">智能合约</span>
          </a>
        )}

        {isRaiser && (isWaiting || isRaising) && (
          <div className="dropdown">
            <button type="button" className="btn btn-outline-light py-0 border-0" data-bs-toggle="dropdown" aria-expanded="false">
              <span className="bi bi-three-dots-vertical fs-3"></span>
            </button>

            <ul className="dropdown-menu dropdown-menu-lg-end">
              <li>
                <a className="dropdown-item" href="#" onClick={handleClose}>
                  <i className="bi bi-x-circle"></i>
                  <span className="ms-2 fw-500">关闭</span>
                </a>
              </li>
            </ul>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <div className="container">
        <LoadingView data={data} error={!!error} loading={isLoading} retry={refetch}>
          <PageHeader
            className={classNames({ 'border-bottom': !showAsset, 'mb-3 pb-0': showAsset })}
            title={title}
            desc={isWorking ? <span className="text-uppercase">算力包 {formatID(param.id)}</span> : '依靠强大的FVM智能合约，合作共建Filecoin存储'}
          >
            <div className="d-flex align-items-center gap-3 text-nowrap">{renderActions()}</div>
          </PageHeader>

          {showAsset && (
            <ul className="nav nav-tabs ffi-tabs mb-3 mb-lg-4">
              <li className="nav-item">
                <NavLink className="nav-link" to={`/assets/${param.id}`}>
                  我的资产
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to={`/overview/${param.id}`}>
                  节点计划
                </NavLink>
              </li>
            </ul>
          )}

          <div className={classNames('d-flex flex-column flex-lg-row', styles.content)}>
            <div id="nav-pills" className={classNames('d-none d-lg-block flex-shrink-0', styles.tabs)}>
              <ul className="nav nav-pills d-flex flex-lg-column mb-2">
                <li className="nav-item">
                  <a className="nav-link" href="#raising">
                    质押目标
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#provider">
                    服务商
                  </a>
                </li>
                <li className={classNames('nav-item', { 'order-1': data && isSuccess })}>
                  <a className="nav-link" href="#deposit">
                    保证金
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#reward">
                    分配方案
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#pledge">
                    质押的归属
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#sector">
                    建设方案
                  </a>
                </li>
                {isSuccess && (
                  <li className="nav-item">
                    <a className="nav-link" href="#seals">
                      封装进度
                    </a>
                  </li>
                )}
                <li className="nav-item order-2">
                  <a className="nav-link" href="#timeline">
                    时间进度
                  </a>
                </li>
                <li className="nav-item order-2">
                  <a className="nav-link" href="#contract">
                    智能合约
                  </a>
                </li>
                {isStarted && (
                  <li className="nav-item order-2">
                    <a className="nav-link" href="#events">
                      事件
                    </a>
                  </li>
                )}
              </ul>
            </div>
            <div
              className={classNames('d-flex flex-column flex-grow-1', styles.main)}
              tabIndex={0}
              data-bs-spy="scroll"
              data-bs-target="#nav-pills"
              data-bs-smooth-scroll="true"
              data-bs-root-margin="0px 0px -80%"
            >
              <section id="raising" className="section">
                <div className="d-flex flex-column gap-3">
                  <SectionRaise data={data} />

                  {responsive.lg ? null : (
                    <>
                      <CardRaise data={data} />

                      <CardStaking data={data} />

                      <CardBack data={data} />

                      <CardAssets data={data} />

                      {/* <CardCalc /> */}
                    </>
                  )}
                </div>
              </section>
              <section id="provider" className="section">
                <div className="section-header">
                  <h4 className="section-title">服务商</h4>
                  <p className="mb-0">开创链上协作新模式，专业化服务，负责任承诺。</p>
                </div>

                <SectionProvider data={data} />
              </section>
              <section id="deposit" className={classNames('section', { 'order-1': data && isSuccess })}>
                <div className="section-header">
                  <h4 className="section-title">保证金</h4>
                  <p className="mb-0">保障节点计划执行，违约自动触发惩罚机制，保护建设者权益。</p>
                </div>

                <SectionDeposit data={data} />
              </section>
              <section id="reward" className="section">
                <div className="section-header">
                  <h4 className="section-title">分配方案</h4>
                  <p className="mb-0">智能合约严格执行分配方案，坚定履约，透明可信，省时省心。</p>
                </div>

                <SectionReward data={data} />
              </section>
              <section id="pledge" className="section">
                <div className="section-header">
                  <h4 className="section-title">质押的归属</h4>
                  <p className="mb-0">质押的所有权永恒不变，投入多少返回多少。</p>
                </div>

                <SectionPledge data={data} />
              </section>
              <section id="sector" className="section">
                <div className="section-header">
                  <h4 className="section-title">建设方案</h4>
                  <p className="mb-0">质押的FIL定向使用，用途不可更改，智能合约保障每个FIL去向可查。</p>
                </div>

                <SectionNode data={data} />
              </section>
              {isSuccess && (
                <section id="seals" className="section">
                  <div className="section-header">
                    <h4 className="section-title">封装进度</h4>
                    <p className="mb-0">封装进展一览无余</p>
                  </div>

                  <SectionSeals data={data} />
                </section>
              )}
              <section id="timeline" className="section order-2">
                <div className="section-header">
                  <h4 className="section-title">时间进度</h4>
                  <p className="mb-0">建设者进展尽在掌握。</p>
                </div>

                <SectionTimeline data={data} />
              </section>
              <section id="contract" className="section order-2">
                <div className="section-header">
                  <h4 className="section-title">智能合约</h4>
                  <p className="mb-0">节点计划是部署在Filecoin上的智能合约，存储节点的建设和激励分配完全由智能合约管理。</p>
                </div>

                <SectionContract data={data} />
              </section>
              {isStarted && (
                <section id="events" className="section order-2">
                  <div className="section-header">
                    <h4 className="section-title">事件</h4>
                    <p className="mb-0">节点计划发生的重要事件以及链上相关消息</p>
                  </div>

                  <SectionEvents data={data} />
                </section>
              )}
            </div>
            <div className={classNames('flex-shrink-0', styles.sidebar)}>
              {responsive.lg ? (
                <>
                  <CardRaise data={data} />

                  <CardStaking data={data} />

                  <CardBack data={data} />

                  <CardAssets data={data} />

                  {/* <CardCalc /> */}
                </>
              ) : null}
            </div>
          </div>
        </LoadingView>
      </div>

      {/* <Calculator /> */}

      <p>
        <br />
      </p>
    </>
  );
}
