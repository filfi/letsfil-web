import { useModel } from '@umijs/max';
import { Form, Input, type FormInstance } from 'antd';
import { forwardRef, useImperativeHandle } from 'react';
import { useDebounceEffect, useDynamicList } from 'ahooks';

import * as V from '@/utils/validators';

export type InvestorItem = API.Base & {
  amount: string;
  address: string;
  disabled?: boolean;
  rate: string;
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
  sub: (index: number) => void;
  reset: (items?: InvestorItem[]) => void;
  insert: (index: number, item?: InvestorItem) => void;
};

function normalizeList(val?: InvestorItem[]) {
  if (Array.isArray(val)) {
    const items = val?.filter(Boolean);

    if (items.length) return items;
  }

  return [{ address: '', rate: '' }];
}

const InvestorListRender: React.ForwardRefRenderFunction<InvestorListActions, InvestorListProps> = (
  { max = 100000, precision = 7, rateMax = 100, ratePrecision = 2, name = 'investors', form },
  ref,
) => {
  const items = Form.useWatch(name, form);
  const [model, setModel] = useModel('stepform');
  const { list, getKey, ...actions } = useDynamicList<API.Base>(normalizeList(model?.investors));

  const handleAdd = () => {
    actions.push({ address: '', rate: '' });
  };

  const handleSub = (index: number) => {
    actions.remove(index);
  };

  const handleInsert = (index: number, item?: InvestorItem) => {
    actions.insert(index, { address: '', rate: '', ...item });
  };

  const handleReset = (items?: InvestorItem[]) => {
    actions.resetList(items ?? []);
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
      if (items) {
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
        <li key={getKey(idx)} className="ps-3 pt-3 pe-5 mb-3 bg-light rounded-3 position-relative">
          <Form.Item
            name={[name, getKey(idx), 'address']}
            initialValue={item.address}
            rules={[{ required: true, message: '请输入建设者钱包地址' }, { validator: V.address }]}
          >
            <Input placeholder="输入建设者地址" />
          </Form.Item>
          <div className="row g-3">
            <div className="col-12 col-md-8 pe-lg-3">
              <Form.Item
                name={[name, getKey(idx), 'amount']}
                initialValue={item.amount}
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
                name={['investors', getKey(idx), 'rate']}
                initialValue={item.rate}
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

          {list.length > 1 && <button className="btn-close position-absolute end-0 top-0 me-3 mt-3" type="button" onClick={() => actions.remove(idx)}></button>}
        </li>
      ))}
    </ul>
  );
};

const InvestorList = forwardRef(InvestorListRender);

export default InvestorList;
