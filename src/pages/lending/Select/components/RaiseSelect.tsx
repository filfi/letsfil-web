import classNames from 'classnames';
import { useMemo, useState } from 'react';

import Avatar from '@/components/Avatar';
import { isMountPlan } from '@/helpers/mount';
import useRaiseBase from '@/hooks/useRaiseBase';
import useRaiseRate from '@/hooks/useRaiseRate';
import { formatAmount, formatSponsor } from '@/utils/format';

const RaiseOption: React.FC<{
  checked?: boolean;
  data?: API.Plan | null;
  onCheck?: () => void;
}> = ({ checked, data, onCheck }) => {
  const { priorityRate } = useRaiseRate(data);
  const { minTarget, target } = useRaiseBase(data);

  return (
    <>
      <div className={classNames('card raise-select-item mb-3', { checked })} onClick={onCheck}>
        <div className="card-header d-flex align-items-center">
          <Avatar address={data?.raiser} size={28} src={data?.sponsor_logo} />
          <div className="flex-fill mx-3">
            {isMountPlan(data) ? (
              <h5 className="mb-0 fs-16 fw-600 text-truncate">
                {formatSponsor(data?.sponsor_company)}掛載節點@{data?.miner_id}
              </h5>
            ) : (
              <h5 className="mb-0 fs-16 fw-600 text-truncate">
                {formatSponsor(data?.sponsor_company)}發起的節點計劃@{data?.miner_id}
              </h5>
            )}
          </div>
          {checked ? (
            <span className="icon-checkbox bi bi-check-circle-fill"></span>
          ) : (
            <span className="icon-checkbox bi bi-circle"></span>
          )}
        </div>
        <div className="card-body pt-2">
          <p className="mb-0">
            <span className="fs-30 fw-600">{priorityRate}%</span>
            <span className="ms-1 text-gray">建設者獲得</span>
          </p>
          <p className="mb-0 text-gray">
            <span>質押目標 {formatAmount(target)} FIL</span>
            <span className="mx-1">·</span>
            <span>成立條件 ≥ {formatAmount(minTarget)} FIL</span>
          </p>
        </div>
      </div>
    </>
  );
};

const RaiseSelect: React.FC<{
  value?: string;
  collapse?: boolean;
  options?: (API.Plan | null)[];
  onChange?: (value: string) => void;
}> = ({ collapse, options, value, onChange }) => {
  const [val, setVal] = useState(value ?? '');

  const curr = useMemo(() => options?.find((i) => i?.raising_id === val), [val, options]);

  const handleCheck = (item: API.Base) => {
    setVal(item.raising_id);
    onChange?.(item.raising_id);
  };

  const renderCurrent = () => {
    return <RaiseOption data={curr} checked />;
  };

  const renderOptions = () => {
    return options?.map(
      (item) =>
        item && (
          <RaiseOption
            data={item}
            key={item.raising_id}
            checked={val === item.raising_id}
            onCheck={() => handleCheck(item)}
          />
        ),
    );
  };

  return (
    <>
      <div className="raise-select">{collapse ? renderCurrent() : renderOptions()}</div>
    </>
  );
};

export default RaiseSelect;
