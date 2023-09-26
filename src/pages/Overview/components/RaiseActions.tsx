import { useMemo } from 'react';

import { SCAN_URL } from '@/constants';
import Dialog from '@/components/Dialog';
import SpinBtn from '@/components/SpinBtn';
import ShareBtn from '@/components/ShareBtn';
import { toastify } from '@/utils/hackify';
import { isMountPlan } from '@/helpers/mount';
import useRaiseBase from '@/hooks/useRaiseBase';
import useRaiseRole from '@/hooks/useRaiseRole';
import useMountState from '@/hooks/useMountState';
import useRaiseState from '@/hooks/useRaiseState';
import useRaiseActions from '@/hooks/useRaiseActions';
import { ReactComponent as IconEdit } from '@/assets/icons/edit-05.svg';
import { ReactComponent as IconTrash } from '@/assets/icons/trash-04.svg';
import { ReactComponent as IconShare4 } from '@/assets/icons/share-04.svg';
import { ReactComponent as IconShare6 } from '@/assets/icons/share-06.svg';

const RaiseActions: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const actions = useRaiseActions(data);
  const { isSuper } = useRaiseRole(data);
  const { actual, minTarget } = useRaiseBase(data);
  const { isActive, isInactive } = useMountState(data);
  const { isPending, isWaiting, isRaising } = useRaiseState(data);

  const isMount = useMemo(() => isMountPlan(data), [data]);
  const name = useMemo(() => (isMount ? '分配计划' : '节点计划'), [isMount]);

  const handleEdit = async () => {
    await toastify(actions.edit)();
  };

  const handleDelete = () => {
    const hide = Dialog.confirm({
      icon: 'delete',
      title: `删除${name}`,
      summary: `未签名的${name}可以永久删除。`,
      confirmLoading: actions.removing,
      onConfirm: async () => {
        hide();

        await toastify(actions.remove)();
      },
    });
  };

  const closeRaise = () => {
    const isSafe = actual >= minTarget;

    const hide = Dialog.confirm({
      icon: 'error',
      title: isSafe ? '提前关闭节点计划' : '关闭节点计划',
      summary: isSafe
        ? '达到最低目标，即可正常结束节点计划。这也意味着节点提前进入封装。扇区封装通常是一项需要排期的工作，注意以下提示'
        : '节点计划已经部署在链上，关闭已经启动的节点计划被视为违约。',
      content: isSafe ? (
        <div className="text-gray">
          <ul>
            <li>提前沟通技术服务商，与封装排期计划保持同步</li>
            <li>检查{name}承诺的封装时间，封装延期将产生罚金</li>
          </ul>
        </div>
      ) : (
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
      confirmText: isSafe ? '提前关闭计划' : '关闭并支付罚金',
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
      title: '关闭分配计划',
      summary: '分配计划已经部署在链上，确定关闭吗？',
      confirmText: '关闭计划',
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

  if (!data) return null;

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

      <ShareBtn className="btn btn-light" text={location.href} toast="链接已复制">
        <IconShare6 />
        <span className="align-middle ms-1">分享</span>
      </ShareBtn>

      {(isMount ? !isInactive : !isPending) && (
        <a className="btn btn-light text-nowrap" href={`${SCAN_URL}/address/${data.raise_address}`} target="_blank" rel="noreferrer">
          <IconShare4 />
          <span className="align-middle ms-1">智能合约</span>
        </a>
      )}

      {isSuper && (isMount ? isActive : isWaiting || isRaising) && (
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

export default RaiseActions;
