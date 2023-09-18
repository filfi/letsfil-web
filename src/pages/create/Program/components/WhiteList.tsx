import { useMemo } from 'react';
import { useDynamicList } from 'ahooks';
import { Button, Col, Form, Input, Row, Space } from 'antd';
import type { FormItemProps } from 'antd';

import * as V from '@/utils/validators';

export type WhiteItem = {
  address: string;
  limit: string;
};

export type WhiteListProps = Omit<FormItemProps, 'label' | 'name'> & {
  name?: string;
  value?: WhiteItem[];
};

function normalizeList(val?: WhiteItem[]) {
  const items = val?.filter(Boolean);

  if (Array.isArray(items) && items.length) return items;

  return [{ address: '', limit: '' }];
}

const WhiteList: React.FC<WhiteListProps> = ({ name, value }) => {
  const { list, getKey, ...actions } = useDynamicList<WhiteItem>(normalizeList(value));

  const fieldName = useMemo(() => name ?? 'whiteList', [name]);

  const handleAdd = (idx: number) => {
    actions.insert(idx, { address: '', limit: '' });
  };

  const handleSub = (idx: number) => {
    actions.remove(idx);
  };

  return (
    <>
      {list.map((item, idx) => (
        <Row key={getKey(idx)} gutter={16}>
          <Col flex={1}>
            <Form.Item name={[fieldName, getKey(idx), 'address']} rules={[{ required: true, message: '请输入钱包地址' }, { validator: V.address }]}>
              <Input placeholder="输入钱包地址" />
            </Form.Item>
          </Col>
          <Col span={24} sm={18} lg={5}>
            <Form.Item
              name={[fieldName, getKey(idx), 'limit']}
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
              <Button size="large" style={{ height: 42 }} onClick={() => handleAdd(idx)}>
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

export default WhiteList;
