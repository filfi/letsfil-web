import { useMemo } from 'react';
import { SCAN_URL } from '@/constants';
import { byte2gb } from '@/utils/utils';
import { formatPower } from '@/utils/format';
import { ReactComponent as NodeIcon } from '@/assets/icons/node-black.svg';

const SectionNode: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
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
          <div className="row row-cols-2 gx-0">
            <div className="col table-row">
              <div className="row g-0 px-2">
                <div className="col-4 table-cell th">建设目标</div>
                <div className="col-8 table-cell text-center">
                  <span className="text-decimal me-1">{size?.[0]}</span>
                  <span className="text-neutral small fw-bold">{size?.[1]}</span>
                </div>
              </div>
            </div>
            <div className="col table-row">
              <div className="row g-0 px-2">
                <div className="col-4 table-cell th">封装时间</div>
                <div className="col-8 table-cell text-center">
                  <span className="text-decimal me-1">&lt; {data?.seal_days}</span>
                  <span className="text-neutral small fw-bold">天</span>
                </div>
              </div>
            </div>
            <div className="col table-row">
              <div className="row g-0 px-2">
                <div className="col-4 table-cell th">扇区大小</div>
                <div className="col-8 table-cell text-center">
                  <span className="text-decimal me-1">{byte2gb(data?.sector_size)}</span>
                  <span className="text-neutral small fw-bold">GB</span>
                </div>
              </div>
            </div>
            <div className="col table-row">
              <div className="row g-0 px-2">
                <div className="col-4 table-cell th">扇区时间</div>
                <div className="col-8 table-cell text-center">
                  <span className="text-decimal me-1">{data?.sector_period}</span>
                  <span className="text-neutral small fw-bold">天</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SectionNode;
