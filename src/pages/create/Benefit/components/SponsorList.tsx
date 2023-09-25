import { useModel } from '@umijs/max';
import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { Form, type FormInstance, Input, type InputProps } from 'antd';
import { useDebounceEffect, useDebounceFn, useMemoizedFn } from 'ahooks';

import * as V from '@/utils/validators';
import useAccount from '@/hooks/useAccount';
import useDynamicList from '@/hooks/useDynamicList';
import { accAdd, accSub, isEqual } from '@/utils/utils';

export type SponsorItem = {
  address: string;
  level?: number;
  rate: string;
  key?: React.Key;
};

export type SponsorListProps = {
  max?: number;
  name?: string;
  form?: FormInstance<any>;
  precision?: number;
};

export type SponsorListActions = {
  add: () => void;
  sub: (key: React.Key) => void;
  reset: (items?: SponsorItem[]) => void;
  insert: (index: number, item?: SponsorItem) => void;
};

function normalizeList(val?: SponsorItem[]) {
  if (Array.isArray(val)) {
    const items = val.filter(Boolean);

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

const SponsorListRender: React.ForwardRefRenderFunction<SponsorListActions, SponsorListProps> = (
  { max = 100, precision = 2, name = 'sponsors', form },
  ref,
) => {
  const { address } = useAccount();

  const items = Form.useWatch(name, form);
  const [model, setModel] = useModel('stepform');

  const raiser = useMemo(() => model?.raiser ?? address, [model?.raiser, address]);

  const { list, ...actions } = useDynamicList(normalizeList(model?.[name]));

  const isRaiser = useMemoizedFn((addr: string) => isEqual(addr, raiser));

  const calcItemRate = useMemoizedFn(() => {
    const list: SponsorItem[] = form?.getFieldValue(name);

    if (Array.isArray(list)) {
      const sum = list.filter(Boolean).reduce((sum, item) => {
        if (isRaiser(item.address)) return sum;

        const val = Number(item.rate);

        if (!Number.isNaN(val)) {
          return accAdd(sum, val);
        }

        return sum;
      }, 0);

      return Math.max(accSub(max, sum), 0);
    }

    return max;
  });

  const updateItem = useMemoizedFn(() => {
    if (!raiser || !name) return;

    const rate = calcItemRate();

    const item = { address: raiser, level: 1, rate: `${rate}` };

    actions.replace(0, { ...item });

    form?.setFieldValue([name, 0], { ...item });
  });

  useDebounceEffect(updateItem, [max, name, raiser], { wait: 200 });

  const handleAdd = () => {
    actions.push({ address: '', level: 2, rate: '' });
  };

  const handleSub = (key: React.Key) => {
    const items = form?.getFieldValue(name);
    const index = list.findIndex((i) => i.key === key);

    if (Array.isArray(items)) {
      items.splice(index, 1);
    }

    actions.remove(index);

    setTimeout(updateItem, 200);
  };

  const handleInsert = (index: number, item?: SponsorItem) => {
    actions.insert(index, { address: '', level: 2, rate: '', ...item });
  };

  const handleReset = (items?: SponsorItem[]) => {
    actions.reset(items ?? [{ address: raiser, level: 1, rate: `${max}` }]);
  };

  const { run: handleRateChange } = useDebounceFn(updateItem, { wait: 200 });

  useImperativeHandle(
    ref,
    () => ({
      add: handleAdd,
      sub: handleSub,
      reset: handleReset,
      insert: handleInsert,
    }),
    [],
  );

  useDebounceEffect(
    () => {
      if (Array.isArray(items)) {
        setModel((data) => {
          if (data) {
            return {
              ...data,
              [name]: items.filter(Boolean).map(({ address = '', level = 2, rate = '' }) => ({
                address,
                level,
                rate,
              })),
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
        <li key={item.key} className="ps-3 pt-3 pe-5 mb-3 bg-light rounded-3 position-relative" style={{ paddingBottom: '0.01px' }}>
          <Form.Item name={[name, idx, 'address']} rules={[{ required: true, message: '请输入主办人钱包地址' }, { validator: V.combineAddr }]}>
            <Input disabled={isRaiser(item.address)} placeholder="输入主办人地址" />
          </Form.Item>
          <Form.Item hidden name={[name, idx, 'level']}>
            <Input />
          </Form.Item>
          <Form.Item
            name={[name, idx, 'rate']}
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
            <button className="btn-close position-absolute end-0 top-0 me-3 mt-3" type="button" onClick={() => handleSub(item.key)}></button>
          )}
        </li>
      ))}
    </ul>
  );
};

const SponsorList = forwardRef(SponsorListRender);

export default SponsorList;
