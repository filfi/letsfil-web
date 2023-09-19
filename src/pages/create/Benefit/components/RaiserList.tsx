import { useModel } from '@umijs/max';
import { Form, FormInstance, Input } from 'antd';
import { forwardRef, useImperativeHandle } from 'react';
import { useDebounceEffect, useDynamicList } from 'ahooks';

import * as V from '@/utils/validators';

export type RaiserItem = {
  address: string;
  disabled?: boolean;
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

  return [{ address: '', rate: '' }];
}

const RaiserListRender: React.ForwardRefRenderFunction<RaiserListActions, RaiserListProps> = ({ max = 100, precision = 2, name = 'raiseList', form }, ref) => {
  const items = Form.useWatch(name, form);
  const [model, setModel] = useModel('stepform');
  const { list, getKey, ...actions } = useDynamicList(normalizeList(model?.[name]));

  const handleAdd = () => {
    actions.push({ address: '', rate: '' });
  };

  const handleInsert = (index: number, item?: RaiserItem) => {
    actions.insert(index, { address: '', rate: '', ...item });
  };

  const handleReset = (items?: RaiserItem[]) => {
    actions.resetList(items ?? []);
  };

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
          <Form.Item
            name={[name, getKey(idx), 'address']}
            initialValue={item.address}
            rules={[{ required: true, message: '请输入主办人钱包地址' }, { validator: V.address }]}
          >
            <Input disabled={item.disabled} placeholder="输入主办人地址" />
          </Form.Item>
          <Form.Item
            name={[name, getKey(idx), 'rate']}
            initialValue={item.rate}
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
            <Input disabled={item.disabled} placeholder="输入算力分配比例" suffix="%" />
          </Form.Item>

          {list.length > 1 && <button className="btn-close position-absolute end-0 top-0 me-3 mt-3" type="button" onClick={() => actions.remove(idx)}></button>}
        </li>
      ))}
    </ul>
  );
};

const RaiserList = forwardRef(RaiserListRender);

export default RaiserList;
