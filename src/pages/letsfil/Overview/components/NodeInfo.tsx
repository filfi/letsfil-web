import { formatByte } from '@/utils/format';
import { ReactComponent as NodeIcon } from '@/assets/icons/node-black.svg';

const NodeInfo: React.FC<{ data?: API.Base }> = ({ data }) => {
  return (
    <>
      <div className="table-responsive">
        <table className="table">
          <tbody>
            <tr>
              <td>
                <div className="d-flex align-items-center">
                  <NodeIcon fill="#1D2939" />
                  <span className="ms-2">{data?.miner_id}</span>
                </div>
              </td>
              <td>规划容量 {formatByte(data?.target_power)}</td>
              <td className="text-end">
                <a href="#">链上查看</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default NodeInfo;
