import classNames from 'classnames';
import { useMemo, useState } from 'react';

import { accMul } from '@/utils/utils';
import { formatAmount, formatID } from '@/utils/format';
import { ReactComponent as IconHdd } from '@/assets/icons/hdd.svg';

type AssetItem = {
  id: string;
  minerId: string;
  pledge: number;
  avaialable: number;
};

const AssetOption: React.FC<{
  data: AssetItem;
  checked?: boolean;
  onCheck?: () => void;
}> = ({ checked, data, onCheck }) => {
  return (
    <>
      <div className={classNames('card asset-select-item mb-3', { checked })} onClick={onCheck}>
        <div className="card-body d-flex">
          <IconHdd />

          <div className="flex-fill mx-3">
            <p className="mb-0">
              <span className="fw-600">{formatAmount(data.pledge)} FIL</span>
              <span className="ms-1">
                {formatID(data.id)}@{data.minerId}
              </span>
            </p>
            <p className="mb-0">還可藉 {formatAmount(accMul(data.avaialable, 2))} FIL</p>
          </div>

          {checked ? (
            <span className="icon-checkbox bi bi-check-circle-fill"></span>
          ) : (
            <span className="icon-checkbox bi bi-circle"></span>
          )}
        </div>
      </div>
    </>
  );
};

const AssetSelect: React.FC<{
  value?: string;
  collapse?: boolean;
  options?: AssetItem[];
  onChange?: (value: string) => void;
}> = ({ collapse, options = [], value, onChange }) => {
  const [val, setVal] = useState(value ?? '');

  const curr = useMemo(() => options.find((i) => i.id === val), [val, options]);

  const handleCheck = (item: AssetItem) => {
    setVal(item.id);
    onChange?.(item.id);
  };

  const renderOptions = () => {
    return options.map((item) => (
      <AssetOption data={item} key={item.id} checked={val === item.id} onCheck={() => handleCheck(item)} />
    ));
  };

  const renderCurrent = () => {
    if (curr && options.length > 3) {
      return <AssetOption data={curr} checked />;
    }

    return renderOptions();
  };

  return (
    <>
      <div className="asset-select">{collapse ? renderCurrent() : renderOptions()}</div>
    </>
  );
};

export default AssetSelect;
