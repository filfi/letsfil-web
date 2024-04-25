import { useMemo } from 'react';
import { useModel } from '@umijs/max';

import { SCAN_URL } from '@/constants';
import Dialog from '@/components/Dialog';
import SpinBtn from '@/components/SpinBtn';
import ShareBtn from '@/components/ShareBtn';
import { toastify } from '@/utils/hackify';
import { isMountPlan } from '@/helpers/mount';
import useMountState from '@/hooks/useMountState';
import useRaiseActions from '@/hooks/useRaiseActions';
import { ReactComponent as IconEdit } from '@/assets/icons/edit-05.svg';
import { ReactComponent as IconTrash } from '@/assets/icons/trash-04.svg';
import { ReactComponent as IconShare4 } from '@/assets/icons/share-04.svg';
import { ReactComponent as IconShare6 } from '@/assets/icons/share-06.svg';

const RaiseActions: React.FC = () => {
  const { base, plan, role, state } = useModel('Overview.overview');

  const actions = useRaiseActions(plan);
  const { isActive, isInactive } = useMountState(plan);

  const { isSuper } = role;
  const { actual, minTarget } = base;
  const { isPending, isStarted, isWaiting, isRaising } = state;

  const isMount = useMemo(() => isMountPlan(plan), [plan]);
  const isSafe = useMemo(() => actual >= minTarget, [actual, minTarget]);
  const name = useMemo(() => (isMount ? '分配計劃' : '節點計劃'), [isMount]);

  const handleEdit = async () => {
    await toastify(actions.edit)();
  };

  const handleDelete = () => {
    const hide = Dialog.confirm({
      icon: 'delete',
      title: `刪除${name}`,
      summary: `未簽名的${name}可以永久刪除。`,
      confirmLoading: actions.removing,
      onConfirm: async () => {
        hide();

        await toastify(actions.remove)();
      },
    });
  };

  const closeRaise = () => {
    if (isStarted) {
      const hide = Dialog.confirm({
        icon: 'error',
        title: isSafe ? '提前關閉節點計劃' : '關閉節點計劃',
        summary: isSafe
          ? '達到最低目標，即可正常結束節點計畫。這也意味著節點提前進入封裝。扇區封裝通常是一項需要排期的工作，注意以下提示'
          : '節點計劃已經部署在鏈上，關閉已經啟動的節點計劃被視為違約。',
        content: isSafe ? (
          <div className="text-gray">
            <ul>
              <li>提前溝通技術服務商，與封裝排期計畫保持同步</li>
              <li>檢查{name}承諾的封裝時間，封裝延期將產生罰款</li>
            </ul>
          </div>
        ) : (
          <div className="text-gray">
            <ul>
              <li>需要向建造者支付投資額的利息</li>
              <li>需要向技術服務商支付保證金利息</li>
            </ul>
            <p>
              <span>智能合約依照規則會產生罰金，罰金則從主辦人保證金中扣除。 </span>
              <a href="#">如何計算罰金？</a>
            </p>
          </div>
        ),
        confirmText: isSafe ? '提前關閉計劃' : '關閉並支付罰金',
        confirmBtnVariant: 'danger',
        confirmLoading: actions.closing,
        onConfirm: async () => {
          hide();

          await toastify(actions.close)();
        },
      });
      return;
    }

    const hide = Dialog.confirm({
      icon: 'error',
      title: '關閉節點計劃',
      summary: '節點計劃已經部署在鏈上，確定關閉嗎？',
      confirmText: '關閉計劃',
      confirmBtnVariant: 'danger',
      confirmLoading: actions.closing,
      onConfirm: async () => {
        hide();

        await toastify(actions.close)();
      },
    });
  };

  const closeMount = () => {
    const hide = Dialog.confirm({
      icon: 'error',
      title: '關閉分配計劃',
      summary: '分配計劃已經部署在鏈上，確定關閉嗎？',
      confirmText: '關閉計劃',
      confirmBtnVariant: 'danger',
      confirmLoading: actions.closing,
      onConfirm: async () => {
        hide();

        await toastify(actions.close)();
      },
    });
  };

  const handleClose = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();

    isMount ? closeMount() : closeRaise();
  };

  if (!plan) return null;

  return (
    <>
      {isSuper && (isMount ? isInactive : isPending) && (
        <>
          <SpinBtn className="btn btn-primary" icon={<IconEdit />} disabled={actions.removing} onClick={handleEdit}>
            修改{name}
          </SpinBtn>

          <SpinBtn className="btn btn-danger" icon={<IconTrash />} loading={actions.removing} onClick={handleDelete}>
            删除
          </SpinBtn>
        </>
      )}

      <ShareBtn className="btn btn-light" text={location.href} toast="連結已複製">
        <IconShare6 />
        <span className="align-middle ms-1">分享</span>
      </ShareBtn>

      {(isMount ? !isInactive : !isPending) && (
        <a
          className="btn btn-light text-nowrap"
          href={`${SCAN_URL}/address/${plan.raise_address}`}
          target="_blank"
          rel="noreferrer"
        >
          <IconShare4 />
          <span className="align-middle ms-1">智能合約</span>
        </a>
      )}

      {isSuper && (isMount ? isActive : isWaiting || isRaising) && (
        <div className="dropdown">
          <button
            type="button"
            className="btn btn-outline-light py-0 border-0"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <span className="bi bi-three-dots-vertical fs-3"></span>
          </button>

          <ul className="dropdown-menu dropdown-menu-lg-end">
            <li>
              <a className="dropdown-item" href="#" onClick={handleClose}>
                <i className="bi bi-x-circle"></i>
                {isSafe ? <span className="ms-2 fw-500">提前結束質押</span> : <span className="ms-2 fw-500">關閉</span>}
              </a>
            </li>
          </ul>
        </div>
      )}
    </>
  );
};

export default RaiseActions;
