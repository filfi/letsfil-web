import SpinBtn from '@/components/SpinBtn';
import { formatDate, formatEther } from '@/utils/format';
import { NodeState } from '@/constants/state';
import { ReactComponent as IconUpload } from '@/assets/icons/upload-03.svg';

const Success: React.FC<{
  data?: API.Base;
  loading?: boolean;
  state?: number;
  onConfirm?: () => void;
}> = ({ data, loading, state = 0, onConfirm }) => {
  return (
    <>
      <div className="card">
        <div className="card-body">
          {state > NodeState.WaitingStart ? (
            <>
              <h5 className="card-title">节点封装已开始，可提取募集保证金</h5>
              <p>该计划的募集保证金共 {formatEther(data?.security_fund)} FIL</p>
            </>
          ) : (
            <>
              <h5 className="card-title">募集目标已达成，等待封装</h5>
              <p>节点封装预计将于 {formatDate(data?.end_seal_time * 1000 + 60000, 'lll')} 开始，封装开始后募集商即可提取募集保证金</p>
            </>
          )}

          <SpinBtn className="btn btn-primary btn-lg w-100" disabled loading={loading} icon={<IconUpload />} onClick={onConfirm}>
            提取募集保证金
          </SpinBtn>
        </div>
      </div>
    </>
  );
};

export default Success;
