import { history, useModel } from '@umijs/max';

import { formatDate } from '@/utils/format';
import useProvider from '@/hooks/useProvider';

export default function CreateConfirm() {
  const [data] = useModel('stepform');

  const { renderLabel } = useProvider();

  const handleSubmit = () => {
    history.push('/letsfil/create/payment');
  };

  return (
    <>
      <div className="letsfil-item">
        <h5 className="letsfil-label">发起账户</h5>
        <p className="mb-0">{data?.sponsor}</p>
      </div>

      <div className="letsfil-item">
        <h5 className="letsfil-label">发起单位</h5>
        <p className="mb-0">{data?.raiseCompany}</p>
      </div>

      <div className="letsfil-item">
        <h5 className="letsfil-label">募集目标</h5>
        <p className="mb-0">{data?.targetAmount} FIL</p>
      </div>

      <div className="letsfil-item">
        <h5 className="letsfil-label">最小募集比例</h5>
        <p className="mb-0">{data?.minRaiseRate}%</p>
      </div>

      <div className="letsfil-item">
        <h5 className="letsfil-label">募集保证金</h5>
        <p className="mb-0">{data?.securityFund} FIL</p>
      </div>

      {/* <div className="letsfil-item">
        <h5 className="letsfil-label">运维保证金</h5>
        <p className="mb-0">{data?.securityFund} FIL</p>
      </div> */}

      <div className="letsfil-item">
        <h5 className="letsfil-label">募集截止时间</h5>
        <p className="mb-0">{data ? formatDate(data.deadline) : ''}</p>
      </div>

      <div className="letsfil-item">
        <h5 className="letsfil-label">服务商</h5>
        <p className="mb-0">{renderLabel(data?.companyId)}</p>
      </div>

      <div className="letsfil-item">
        <h5 className="letsfil-label">募集商丨投资者丨服务商 权益占比</h5>
        <p className="mb-0">
          {data?.raiserShare}% | {data?.investorShare}% | {data?.servicerShare}%
        </p>
      </div>

      <div className="letsfil-item">
        <h5 className="letsfil-label">Miner ID</h5>
        <p className="mb-0">{data?.minerID}</p>
      </div>

      <div className="letsfil-item">
        <h5 className="letsfil-label">节点大小</h5>
        <p className="mb-0">{data?.nodeSize}P</p>
      </div>

      {/* <div className="letsfil-item">
        <h5 className="letsfil-label">单个扇区大小</h5>
        <p className="mb-0">{data?.sectorSize}GB</p>
      </div> */}

      <div className="letsfil-item">
        <h5 className="letsfil-label">节点运行周期</h5>
        <p className="mb-0">{data?.nodePeriod}天</p>
      </div>

      <div className="letsfil-item">
        <h5 className="letsfil-label">节点封装期限</h5>
        <p className="mb-0">{data?.sealPeriod}天</p>
      </div>

      <div className="letsfil-item letsfil-actions">
        <button className="btn btn-light" type="button" onClick={history.back}>
          上一步
        </button>
        <button className="btn btn-primary ms-4" type="button" onClick={handleSubmit}>
          提交
        </button>
      </div>
    </>
  );
}
