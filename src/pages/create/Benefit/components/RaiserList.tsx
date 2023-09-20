import { useModel } from '@umijs/max';
import { Form, type FormInstance, Input, type InputProps } from 'antd';
import { useDebounceEffect, useDebounceFn, useDynamicList } from 'ahooks';
import { forwardRef, useEffect, useImperativeHandle, useMemo } from 'react';

import * as V from '@/utils/validators';
import useAccount from '@/hooks/useAccount';
import { accAdd, accSub, isEqual } from '@/utils/utils';

export type RaiserItem = {
  address: string;
  rate: string;
};

export type RaiserListProps = {
  max?: number;
  name?: string;
  form?: FormInstance<any>;
  precision?: number;
};

export type RaiserListActions = {
  add: () => void;
  reset: (items?: RaiserItem[]) => void;
  insert: (index: number, item?: RaiserItem) => void;
};

function normalizeList(val?: RaiserItem[]) {
  if (Array.isArray(val)) {
    const items = val?.filter(Boolean);

    if (items.length) return items;
  }

  return [];
}

type RateInputProps = InputProps & {
  onChangeText?: (val: string) => void;
};
const RateInput: React.FC<RateInputProps> = ({ onChange, onChangeText, ...props }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    onChangeText?.(e.target.value);
  };

  return <Input {...props} onChange={handleChange} />;
};

const RaiserListRender: React.ForwardRefRenderFunction<RaiserListActions, RaiserListProps> = ({ max = 100, precision = 2, name = 'raiseList', form }, ref) => {
  const { address } = useAccount();

  const items = Form.useWatch(name, form);
  const [model, setModel] = useModel('stepform');

  const raiser = useMemo(() => model?.raiser ?? address, [model?.raiser, address]);
  const { list, getKey, ...actions } = useDynamicList(normalizeList(model?.[name]));

  const isRaiser = (addr: string) => isEqual(addr, raiser);

  useEffect(() => {
    if (raiser) {
      const item = list.find((i) => isRaiser(i.address));

      if (!item) {
        const items = [{ address: raiser, rate: max }, ...list];
        actions.insert(0, { address: raiser, rate: '' });
        form?.setFieldValue(name, items);
      }
    }
  }, [raiser, list]);

  const handleAdd = () => {
    actions.push({ address: '', rate: '' });
  };

  const handleInsert = (index: number, item?: RaiserItem) => {
    actions.insert(index, { address: '', rate: '', ...item });
  };

  const handleReset = (items?: RaiserItem[]) => {
    actions.resetList(items ?? []);
  };

  const { run: handleRateChange } = useDebounceFn(
    () => {
      const list: RaiserItem[] = form?.getFieldValue(name) ?? [];

      const sum = list.filter(Boolean).reduce((sum, item) => {
        if (isRaiser(item.address)) return sum;

        const val = Number(item.rate);

        if (!Number.isNaN(val)) {
          return accAdd(sum, val);
        }

        return sum;
      }, 0);

      const sub = Math.max(accSub(max, sum), 0);
      const index = list.findIndex((i) => isRaiser(i.address));
      const newItem = { address: raiser, rate: `${sub}` };

      actions.replace(index, newItem);
      form?.setFieldValue([name, getKey(index)], newItem);
    },
    { wait: 200 },
  );

  useImperativeHandle(
    ref,
    () => ({
      add: handleAdd,
      reset: handleReset,
      insert: handleInsert,
    }),
    [],
  );

  useDebounceEffect(
    () => {
      if (items) {
        setModel((data) => {
          if (data) {
            return {
              ...data,
              [name]: items.filter(Boolean),
            };
          }

          return data;
        });
      }
    },
    [items],
    { wait: 300 },
  );

  return (
    <ul className="list-unstyled">
      {list.map((item, idx) => (
        <li key={getKey(idx)} className="ps-3 pt-3 pe-5 mb-3 bg-light rounded-3 position-relative" style={{ paddingBottom: '0.01px' }}>
          <Form.Item name={[name, getKey(idx), 'address']} rules={[{ required: true, message: '请输入主办人钱包地址' }, { validator: V.address }]}>
            <Input disabled={isRaiser(item.address)} placeholder="输入主办人地址" />
          </Form.Item>
          <Form.Item
            name={[name, getKey(idx), 'rate']}
            rules={[
              { required: true, message: '请输入算力分配比例' },
              {
                validator: V.Queue.create()
                  .add(V.createGtValidator(0))
                  .add(V.createNumRangeValidator([0, max], `请输入0-${max}之间的数`))
                  .add(V.createDecimalValidator(precision, `最多支持${precision}位小数`))
                  .build(),
              },
            ]}
          >
            <RateInput type="number" disabled={isRaiser(item.address)} placeholder="输入算力分配比例" suffix="%" onChangeText={handleRateChange} />
          </Form.Item>

          {list.length > 1 && !isRaiser(item.address) && (
            <button className="btn-close position-absolute end-0 top-0 me-3 mt-3" type="button" onClick={() => actions.remove(idx)}></button>
          )}
        </li>
      ))}
    </ul>
  );
};

const RaiserList = forwardRef(RaiserListRender);

export default RaiserList;