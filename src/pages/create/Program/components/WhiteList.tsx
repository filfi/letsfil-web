import { useModel } from '@umijs/max';
import { forwardRef, useImperativeHandle } from 'react';
import { useDebounceEffect, useDynamicList } from 'ahooks';
import { Button, Col, Form, Input, Row, Space } from 'antd';
import type { FormInstance, FormItemProps } from 'antd';

import * as V from '@/utils/validators';

export type WhiteItem = {
  address: string;
  limit: string;
};

export type WhiteListProps = Omit<FormItemProps, 'label' | 'name'> & {
  name?: string;
  form?: FormInstance;
};

export type WhiteListActions = {
  add: () => void;
  sub: (index: number) => void;
  reset: (items?: WhiteItem[]) => void;
  insert: (index: number, item?: WhiteItem) => void;
};

function normalizeList(val?: WhiteItem[]) {
  if (Array.isArray(val)) {
    const items = val.filter(Boolean);

    if (items.length) return items;
  }

  return [{ address: '', limit: '' }];
}

const WhiteListRender: React.ForwardRefRenderFunction<WhiteListActions, WhiteListProps> = ({ form, name = 'whitelist' }, ref) => {
  const items = Form.useWatch(name, form);
  const [model, setModel] = useModel('stepform');

  const { list, getKey, ...actions } = useDynamicList<WhiteItem>(normalizeList(model?.[name]));

  const handleAdd = () => {
    actions.push({ address: '', limit: '' });
  };

  const handleSub = (idx: number) => {
    actions.remove(idx);
  };

  const handleInsert = (index: number, item?: WhiteItem) => {
    actions.insert(index, { address: '', limit: '', ...item });
  };

  const handleReset = (items?: WhiteItem[]) => {
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
              [name]: items.filter(Boolean).map(({ address = '', limit = '' }) => ({
                address,
                limit,
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
    <>
      {list.map((item, idx) => (
        <Row key={getKey(idx)} gutter={16}>
          <Col flex={1}>
            <Form.Item
              name={[name, getKey(idx), 'address']}
              initialValue={item.address}
              rules={[{ required: true, message: '请输入钱包地址' }, { validator: V.combineAddr }]}
            >
              <Input placeholder="输入钱包地址" />
            </Form.Item>
          </Col>
          <Col span={24} sm={18} lg={5}>
            <Form.Item
              name={[name, getKey(idx), 'limit']}
              initialValue={item.limit}
              rules={[
                {
                  validator: V.Queue.create().add(V.number).add(V.createGtValidator(0, '必须大于0')).build(),
                },
              ]}
            >
              <Input type="number" placeholder="限额" suffix="FIL" />
            </Form.Item>
          </Col>
          <Col>
            <Space>
              <Button size="large" style={{ height: 42 }} onClick={() => handleInsert(idx + 1)}>
                <span className="bi bi-plus-lg fw-bold"></span>
              </Button>
              <Button size="large" disabled={list.length <= 1} style={{ height: 42 }} onClick={() => handleSub(idx)}>
                <span className="bi bi-dash-lg fw-bold"></span>
              </Button>
            </Space>
          </Col>
        </Row>
      ))}
    </>
  );
};

const WhiteList = forwardRef(WhiteListRender);

export default WhiteList;
