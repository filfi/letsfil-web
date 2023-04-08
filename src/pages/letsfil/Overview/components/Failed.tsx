import SpinBtn from '@/components/SpinBtn';
import { formatEther } from '@/utils/format';
import { ReactComponent as IconUpload } from '@/assets/icons/upload-03.svg';

const Failed: React.FC<{
  amount?: string;
  loading?: boolean;
  state?: number;
  onConfirm?: () => void;
}> = ({ amount, loading, onConfirm }) => {
  return (
    <>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">未达成募集目标，募集失败</h5>
          <p>该计划的募集保证金共 {formatEther(amount)} FIL</p>

          <SpinBtn className="btn btn-primary btn-lg w-100" loading={loading} icon={<IconUpload />} onClick={onConfirm}>
            提取募集保证金
          </SpinBtn>
        </div>
      </div>
    </>
  );
};

export default Failed;
