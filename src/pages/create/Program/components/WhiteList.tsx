import { useModel } from '@umijs/max';
import { useDebounceEffect } from 'ahooks';
import { forwardRef, useImperativeHandle } from 'react';
import { Button, Col, Form, Input, Row, Space } from 'antd';
import type { FormInstance, FormItemProps } from 'antd';

import * as V from '@/utils/validators';
import useDynamicList from '@/hooks/useDynamicList';

export type WhiteItem = {
  address: string;
  limit: string;
  key?: React.Key;
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

  const { list, ...actions } = useDynamicList(normalizeList(model?.[name]));

  const handleAdd = () => {
    actions.push({ address: '', limit: '' });
  };

  const handleSub = (key: React.Key) => {
    const items = form?.getFieldValue(name);
    const index = list.findIndex((i) => i.key === key);

    if (Array.isArray(items)) {
      items.splice(index, 1);
    }

    actions.remove(index);
  };

  const handleInsert = (index: number, item?: WhiteItem) => {
    actions.insert(index, { address: '', limit: '', ...item });
  };

  const handleReset = (items?: WhiteItem[]) => {
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
        <Row key={item.key} gutter={16}>
          <Col flex={1}>
            <Form.Item name={[name, idx, 'address']} rules={[{ required: true, message: '请输入钱包地址' }, { validator: V.combineAddr }]}>
              <Input placeholder="输入钱包地址" />
            </Form.Item>
          </Col>
          <Col span={24} sm={18} lg={5}>
            <Form.Item
              name={[name, idx, 'limit']}
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
              <Button size="large" disabled={list.length <= 1} style={{ height: 42 }} onClick={() => handleSub(item.key)}>
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
