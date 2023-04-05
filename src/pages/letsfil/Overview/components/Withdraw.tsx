import SpinBtn from '@/components/SpinBtn';
import { formatEther } from '@/utils/format';
import { ReactComponent as MinusIcon } from '@/assets/icons/minus-circle.svg';

const Withdraw: React.FC<{
  amount?: string;
  loading?: boolean;
  onConfirm?: () => void;
}> = ({ amount, loading, onConfirm }) => {
  return (
    <>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">计划已关闭</h5>
          <p>该计划的募集保证金共 {formatEther(amount)} FIL</p>

          <SpinBtn
            className="btn btn-primary btn-lg w-100"
            loading={loading}
            icon={<MinusIcon />}
            onClick={onConfirm}
          >
            提取募集保证金
          </SpinBtn>
        </div>
      </div>
    </>
  );
};

export default Withdraw;
