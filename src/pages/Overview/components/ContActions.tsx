import { SCAN_URL } from '@/constants';
import Dialog from '@/components/Dialog';
import SpinBtn from '@/components/SpinBtn';
import ShareBtn from '@/components/ShareBtn';
import useRaiseRole from '@/hooks/useRaiseRole';
import useRaiseState from '@/hooks/useRaiseState';
import useRaiseActions from '@/hooks/useRaiseActions';
import { ReactComponent as IconEdit } from '@/assets/icons/edit-05.svg';
import { ReactComponent as IconTrash } from '@/assets/icons/trash-04.svg';
import { ReactComponent as IconShare4 } from '@/assets/icons/share-04.svg';
import { ReactComponent as IconShare6 } from '@/assets/icons/share-06.svg';

const ContActions: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const actions = useRaiseActions(data);
  const { isRaiser } = useRaiseRole(data);
  const { isPending, isWaiting, isRaising } = useRaiseState(data);

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

      {(isWaiting || isRaising) && isRaiser && (
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

export default ContActions;
