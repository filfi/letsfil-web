import { useMemo } from 'react';
import { SCAN_URL } from '@/constants';
import { byte2gb } from '@/utils/utils';
import { formatPower } from '@/utils/format';
import useRaiseDetail from '@/hooks/useRaiseDetail';
import { ReactComponent as NodeIcon } from '@/assets/icons/node-black.svg';

const SectionNode: React.FC = () => {
  const { data } = useRaiseDetail();

  const size = useMemo(() => formatPower(data?.target_power ?? 0), [data?.target_power]);

  return (
    <>
      <div className="table-responsive">
        <div className="card">
          <div className="card-header d-flex align-items-center px-3 px-lg-4">
            <div className="d-flex align-items-center">
              <NodeIcon fill="#1D2939" />
              <span className="card-title ms-3 mb-0 fw-600">{data?.miner_id}</span>
            </div>
            <a className="ms-auto" href={`${SCAN_URL}/address/${data?.miner_id}`} target="_blank" rel="noreferrer">
              链上查看
            </a>
          </div>
          <table className="table mb-0">
            <tbody>
              <tr>
                <th className="ps-3 ps-lg-4">建设目标（QAP）</th>
                <td>
                  <span className="text-decimal me-1">{size?.[0]}</span>
                  <span className="text-neutral small fw-bold">{size?.[1]}</span>
                </td>
                <th>扇区时间</th>
                <td className="pe-3 pe-lg-4">
                  <span className="text-decimal me-1">{data?.sector_period}</span>
                  <span className="text-neutral small fw-bold">天</span>
                </td>
              </tr>
              <tr>
                <th className="ps-3 ps-lg-4">扇区大小</th>
                <td>
                  <span className="text-decimal me-1">{byte2gb(data?.sector_size)}</span>
                  <span className="text-neutral small fw-bold">GB</span>
                </td>
                <th>封装承诺</th>
                <td className="pe-3 pe-lg-4">
                  <span className="text-decimal me-1">&lt; {data?.seal_days}</span>
                  <span className="text-neutral small fw-bold">天</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default SectionNode;
