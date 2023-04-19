import Modal from '@/components/Modal';
import SpinBtn from '@/components/SpinBtn';
import useProcessify from '@/hooks/useProcessify';
import usePlanContract from '@/hooks/usePlanContract';
import { ReactComponent as MinusIcon } from '@/assets/icons/minus-circle.svg';

const withConfirm = <P extends unknown[]>(handler?: (...args: P) => void) => {
  return (...args: P) => {
    Modal.confirm({
      title: '确定关闭计划吗？',
      content: '关闭计划会产生罚金，从募集保证金中扣除',
      onConfirm: () => {
        handler?.(...args);
      },
    });
  };
};

const Closer: React.FC<{ data?: API.Plan; loading?: boolean; onConfirm?: () => void }> = ({ data }) => {
  const contract = usePlanContract(data?.raise_address);

  // 关闭计划
  const [loading, handleClose] = useProcessify(async () => {
    await contract.closeRaisePlan();
  });

  const onClose = withConfirm(handleClose);

  return (
    <>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">关闭此计划</h5>
          <p className="mb-0">您需要支付罚金以关闭计划，关闭后投资者已质押的Fil将返还用户，产生的Gas费也将由您账户承担</p>
          <p>
            &nbsp;
            {/* <a href="#">查看罚金计算规则</a> */}
          </p>

          <SpinBtn className="btn btn-primary btn-lg w-100" loading={loading} icon={<MinusIcon />} onClick={onClose}>
            {loading ? '正在关闭' : '关闭计划'}
          </SpinBtn>
        </div>
      </div>
    </>
  );
};

export default Closer;
