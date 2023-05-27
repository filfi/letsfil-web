import { useMemo } from 'react';
import { SCAN_URL } from '@/constants';
import { byte2gb } from '@/utils/utils';
import { formatByte } from '@/utils/format';
import { ReactComponent as NodeIcon } from '@/assets/icons/node-black.svg';
import type { ItemProps } from './types';

const SectionNode: React.FC<ItemProps> = ({ data }) => {
  const size = useMemo(() => formatByte(data?.target_power ?? 0, '0 ib').split(' '), [data]);

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
                <th className="ps-3 ps-lg-4">新增容量</th>
                <td>
                  <span className="text-decimal me-1">{size[0]}</span>
                  <span className="text-neutral small fw-bold">{size[1]}</span>
                </td>
                <th>扇区时间</th>
                <td className="pe-3 pe-lg-4">
                  <span className="text-decimal me-1">{data?.sector_period}</span>
                  <span className="text-neutral small fw-bold">天</span>
                </td>
              </tr>
              <tr>
                <td className="ps-3 ps-lg-4">扇区大小</td>
                <td>
                  <span className="text-decimal me-1">{byte2gb(data?.sector_size)}</span>
                  <span className="text-neutral small fw-bold">GB</span>
                </td>
                <th>封装时间</th>
                <td className="pe-3 pe-lg-4">
                  <span className="text-decimal me-1">{data?.seal_days}</span>
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
