import { useMemo } from 'react';
import { camelCase } from 'lodash';
import classNames from 'classnames';
import { ScrollSpy } from 'bootstrap';
import { useResponsive, useUpdateEffect } from 'ahooks';
import { NavLink, history, useModel, useParams } from '@umijs/max';

import styles from './styles.less';
import * as H from '@/helpers/app';
import { SCAN_URL } from '@/constants';
import { EventType } from '@/utils/mitt';
import Dialog from '@/components/Dialog';
import SpinBtn from '@/components/SpinBtn';
import ShareBtn from '@/components/ShareBtn';
import { formatSponsor } from '@/utils/format';
import PageHeader from '@/components/PageHeader';
import LoadingView from '@/components/LoadingView';
import RaiseProvider from '@/components/RaiseProvider';
import useRaiseDetail from '@/hooks/useRaiseDetail';
import useEmittHandler from '@/hooks/useEmitHandler';
import useRaiseActions from '@/hooks/useRaiseActions';
// import CardFAQ from './components/CardFAQ';
// import CardCalc from './components/CardCalc';
import CardBack from './components/CardBack';
import CardRaise from './components/CardRaise';
import CardAssets from './components/CardAssets';
// import Calculator from './components/Calculator';
import CardStaking from './components/CardStaking';
import SectionCoin from './components/SectionCoin';
import SectionNode from './components/SectionNode';
import SectionRaise from './components/SectionRaise';
import SectionEvents from './components/SectionEvents';
import SectionReward from './components/SectionReward';
import SectionSector from './components/SectionSector';
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

function RaiseContent() {
  const param = useParams();
  const responsive = useResponsive();
  const [, setModel] = useModel('stepform');

  const { data, error, loading, info, state, refresh } = useRaiseDetail();

  const { isRaiser } = info;
  const { isPending, isWaiting, isWorking, isRaising, isStarted, isSuccess } = state;

  const actions = useRaiseActions(data);

  const title = useMemo(() => (data ? `${formatSponsor(data.sponsor_company)}发起的节点计划@${data.miner_id}` : '-'), [data]);

  useUpdateEffect(updateScrollSpy, [data, isStarted]);

  useEmittHandler<any>({
    [EventType.onStaking]: refresh,
    [EventType.onUnstaking]: refresh,
    [EventType.onStartPreSeal]: refresh,
    [EventType.onDepositOpsFund]: refresh,
    [EventType.onServicerSigned]: refresh,
    [EventType.onStartRaisePlan]: refresh,
    [EventType.onCreateRaisePlan]: refresh,
    [EventType.onDepositRaiseFund]: refresh,
    [EventType.onNodeStateChange]: refresh,
    [EventType.onRaiseStateChange]: refresh,
    [EventType.onWithdrawOpsFund]: refresh,
    [EventType.onWithdrawRaiseFund]: refresh,
  });

  const handleEdit = () => {
    if (!data) return;

    const model = Object.keys(data).reduce(
      (d, key) => ({
        ...d,
        [camelCase(key)]: data[key as keyof typeof data],
      }),
      {},
    );

    setModel(H.transformModel(model));

    history.replace('/create');
  };

  const handleDelete = () => {
    const hide = Dialog.confirm({
      icon: 'delete',
      title: '删除节点计划',
      summary: '未签名的节点计划可以永久删除。',
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
            <span className="align-middle ms-1">查看智能合约</span>
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

  const renderMain = () => {
    if (responsive.lg) return null;

    return (
      <>
        <CardRaise />

        <CardStaking />

        <CardBack />

        <CardAssets />

        {/* <CardCalc /> */}
      </>
    );
  };

  const renderCard = () => {
    if (responsive.lg) {
      return (
        <>
          <CardRaise />

          <CardStaking />

          <CardBack />

          <CardAssets />

          {/* <CardCalc /> */}
        </>
      );
    }

    return null;
  };

  return (
    <>
      <div className="container">
        <LoadingView data={data} error={!!error} loading={loading} retry={refresh}>
          <PageHeader
            className={classNames({ 'border-bottom': !isWorking, 'mb-3 pb-0': isWorking })}
            title={title}
            desc={isWorking ? `算力包：${param.id}` : '依靠强大的FVM智能合约，合作共建Filecoin存储'}
          >
            <div className="d-flex align-items-center gap-3 text-nowrap">{renderActions()}</div>
          </PageHeader>

          {isWorking && (
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
              <ul className="nav nav-pills flex-lg-column mb-2">
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
                <li className="nav-item">
                  <a className="nav-link" href="#reward">
                    分配方案
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#node">
                    建设方案
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#deposit">
                    保证金
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#timeline">
                    时间进度
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#contract">
                    智能合约
                  </a>
                </li>
                {isStarted && (
                  <li className="nav-item">
                    <a className="nav-link" href="#events">
                      事件
                    </a>
                  </li>
                )}
              </ul>
            </div>
            <div className={classNames('flex-grow-1')} tabIndex={0} data-bs-spy="scroll" data-bs-target="#nav-pills" data-bs-smooth-scroll="true">
              <section id="raising" className="section">
                <div className="d-flex flex-column gap-3">
                  <SectionRaise />

                  {renderMain()}
                </div>
              </section>
              <section id="provider" className="section">
                <div className="section-header">
                  <h4 className="section-title">服务商</h4>
                  <p className="mb-0">开创链上协作新模式，专业化服务，负责任承诺。</p>
                </div>

                <SectionProvider />
              </section>
              <section id="reward">
                <div className="section">
                  <div className="section-header">
                    <h4 className="section-title">节点激励分配方案</h4>
                    <p className="mb-0">节点计划严格执行分配方案，坚定履约，透明可信，省时省心。</p>
                  </div>

                  <SectionReward />
                </div>

                <div className="section">
                  <div className="section-header">
                    <h4 className="section-title">质押的归属</h4>
                    <p className="mb-0">质押的所有权永恒不变，投入多少返回多少。</p>
                  </div>

                  <SectionCoin />
                </div>
              </section>
              <section id="node" className="section">
                <div className="section-header">
                  <h4 className="section-title">建设方案</h4>
                  <p className="mb-0">集合质押FIL用途明确，不可更改，智能合约保障每个FIL的去向透明可查。</p>
                </div>

                <SectionNode />
              </section>
              {isSuccess && (
                <section id="sector" className="section">
                  <div className="section-header">
                    <h4 className="section-title">封装扇区</h4>
                    <p className="mb-0">封装进展一览无余</p>
                  </div>

                  <SectionSector />
                </section>
              )}
              <section id="deposit" className="section">
                <div className="section-header">
                  <h4 className="section-title">保证金</h4>
                  <p className="mb-0">保障节点计划执行，异常自动触发惩罚机制，保护建设者权益。</p>
                </div>

                <SectionDeposit />
              </section>
              <section id="timeline" className="section">
                <div className="section-header">
                  <h4 className="section-title">时间进度</h4>
                  <p className="mb-0">建设者对每一步进展尽在掌握。</p>
                </div>

                <SectionTimeline />
              </section>
              <section id="contract" className="section">
                <div className="section-header">
                  <h4 className="section-title">智能合约</h4>
                  <p className="mb-0">节点计划是部署在Filecoin上的智能合约，存储节点的质押和节点激励分配完全由智能合约管理。</p>
                </div>

                <SectionContract />
              </section>
              {isStarted && (
                <section id="events" className="section">
                  <div className="section-header">
                    <h4 className="section-title">事件</h4>
                    <p className="mb-0">节点计划发生的重要事件以及链上相关消息</p>
                  </div>

                  <SectionEvents />
                </section>
              )}
            </div>
            <div className={classNames('flex-shrink-0', styles.sidebar)}>{renderCard()}</div>
          </div>
        </LoadingView>
      </div>

      {/* <Calculator /> */}

      <p>
        <br />
      </p>
      <p>
        <br />
      </p>
    </>
  );
}

export default function Overview() {
  const param = useParams();

  return (
    <RaiseProvider id={param.id}>
      <RaiseContent />
    </RaiseProvider>
  );
}
