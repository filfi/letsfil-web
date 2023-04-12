import { useMemoizedFn } from 'ahooks';

import Modal from '@/components/Modal';
import SpinBtn from '@/components/SpinBtn';
import { ReactComponent as MinusIcon } from '@/assets/icons/minus-circle.svg';

const Closer: React.FC<{ loading?: boolean; onConfirm?: () => void }> = ({ loading, onConfirm }) => {
  const handleClose = useMemoizedFn(() => {
    Modal.confirm({
      title: '确定关闭计划吗？',
      content: '关闭计划会产生罚金，从募集保证金中扣除',
      confirmText: '确定关闭',
      onConfirm: () => {
        onConfirm?.();
      },
    });
  });

  return (
    <>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">关闭此计划</h5>
          <p>您需要支付罚金以关闭计划，关闭后投资者已质押的Fil将返还用户，产生的Gas费也将由您账户承担</p>

          <SpinBtn className="btn btn-primary btn-lg w-100" loading={loading} icon={<MinusIcon />} onClick={handleClose}>
            {loading ? '正在关闭' : '关闭计划'}
          </SpinBtn>
        </div>
      </div>
    </>
  );
};

export default Closer;
