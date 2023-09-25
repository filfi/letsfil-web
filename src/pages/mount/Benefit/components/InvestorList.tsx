import { useModel } from '@umijs/max';
import { useDebounceEffect } from 'ahooks';
import { Form, Input, type FormInstance } from 'antd';
import { forwardRef, useImperativeHandle } from 'react';

import * as V from '@/utils/validators';
import useDynamicList from '@/hooks/useDynamicList';

export type InvestorItem = {
  amount: string;
  address: string;
  disabled?: boolean;
  rate: string;
  key?: React.Key;
};

export type InvestorListProps = {
  max?: number;
  name?: string;
  rateMax?: number;
  precision?: number;
  ratePrecision?: number;
  form?: FormInstance<any>;
};

export type InvestorListActions = {
  add: () => void;
  sub: (key: React.Key) => void;
  reset: (items?: InvestorItem[]) => void;
  insert: (index: number, item?: InvestorItem) => void;
};

function normalizeList(val?: InvestorItem[]) {
  if (Array.isArray(val)) {
    const items = val.filter(Boolean);

    if (items.length) return items;
  }

  return [{ address: '', rate: '' }] as InvestorItem[];
}

const InvestorListRender: React.ForwardRefRenderFunction<InvestorListActions, InvestorListProps> = (
  { max = 100000, precision = 7, rateMax = 100, ratePrecision = 2, name = 'investors', form },
  ref,
) => {
  const items = Form.useWatch(name, form);
  const [model, setModel] = useModel('stepform');
  const { list, ...actions } = useDynamicList(normalizeList(model?.[name]));

  const handleAdd = () => {
    actions.push({ address: '', amount: '', rate: '' });
  };

  const handleSub = (key: React.Key) => {
    const items = form?.getFieldValue(name);
    const index = list.findIndex((i) => i.key === key);

    if (Array.isArray(items)) {
      items.splice(index, 1);
    }

    actions.remove(index);
  };

  const handleInsert = (index: number, item?: InvestorItem) => {
    actions.insert(index, { address: '', amount: '', rate: '', ...item });
  };

  const handleReset = (items?: InvestorItem[]) => {
    actions.reset(items ?? []);
  };

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
              [name]: items.filter(Boolean).map(({ address = '', amount = '', rate = '' }) => ({
                address,
                amount,
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
        <li key={item.key} className="ps-3 pt-3 pe-5 mb-3 bg-light rounded-3 position-relative">
          <Form.Item name={[name, idx, 'address']} rules={[{ required: true, message: '请输入建设者钱包地址' }, { validator: V.combineAddr }]}>
            <Input placeholder="输入建设者地址" />
          </Form.Item>
          <div className="row g-3">
            <div className="col-12 col-md-8 pe-lg-3">
              <Form.Item
                name={[name, idx, 'amount']}
                rules={[
                  { required: true, message: '请输入持有质押数量' },
                  {
                    validator: V.Queue.create()
                      .add(V.createNumRangeValidator([1, max], `请输入1-${max}之间的数`))
                      .add(V.createDecimalValidator(precision, `最多支持${precision}位小数`))
                      .build(),
                  },
                ]}
              >
                <Input placeholder="输入持有质押数量" suffix="FIL" />
              </Form.Item>
            </div>
            <div className="col-12 col-md-4">
              <Form.Item
                name={['investors', idx, 'rate']}
                rules={[
                  { required: true, message: '请输入算力分配比例' },
                  {
                    validator: V.Queue.create()
                      .add(V.createGtValidator(0))
                      .add(V.createNumRangeValidator([0, rateMax], `请输入0-${rateMax}之间的数`))
                      .add(V.createDecimalValidator(ratePrecision, `最多支持${ratePrecision}位小数`))
                      .build(),
                  },
                ]}
              >
                <Input placeholder="输入算力分配比例" suffix="%" />
              </Form.Item>
            </div>
          </div>

          {list.length > 1 && <button className="btn-close position-absolute end-0 top-0 me-3 mt-3" type="button" onClick={() => handleSub(item.key)}></button>}
        </li>
      ))}
    </ul>
  );
};

const InvestorList = forwardRef(InvestorListRender);

export default InvestorList;
