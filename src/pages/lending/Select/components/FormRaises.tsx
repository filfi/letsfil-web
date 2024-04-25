import { Form } from 'antd';
import { useMemo } from 'react';
import { /* useBoolean, */ useRequest, useUpdateEffect } from 'ahooks';
import type { FormInstance } from 'antd';

import RaiseSelect from './RaiseSelect';
import { listLoans } from '@/apis/raise';
import LoadingView from '@/components/LoadingView';

const FormRaises: React.FC<{
  account?: string;
  form: FormInstance;
  name: string;
  onDataChange?: (list: any[]) => void;
}> = ({ account, /* form, */ name, onDataChange }) => {
  const service = async () => {
    if (account) {
      return await listLoans({ invest_address: account, page_size: 1000 });
    }
  };

  // const [collapse, { setFalse }] = useBoolean(Boolean(form.getFieldValue(name)));
  const { data, error, loading, refresh } = useRequest(service, { refreshDeps: [account] });

  const list = useMemo(() => data?.list ?? [], [data?.list]);
  // const total = useMemo(() => list.length, [list]);

  useUpdateEffect(() => {
    onDataChange?.(list);
  }, [list]);

  return (
    <>
      <div className="d-flex align-items-center mb-1">
        <div className="flex-fill me-3">
          <h5 className="mb-0 fw-600">選擇節點計劃</h5>
        </div>

        {/* {total > 3 && collapse && (
          <button className="btn btn-link p-0 text-reset fw-600" type="button" onClick={setFalse}>
            显示全部 {total} 項開放中計劃
          </button>
        )} */}
      </div>
      <p className="mb-3 text-gray">獲得借款將全部投入選擇的節點計劃</p>

      <LoadingView
        className=""
        data={list}
        error={!!error}
        loading={loading}
        emptyTitle="暫無開放中節點計劃"
        retry={refresh}
      >
        <Form.Item name={name} rules={[{ required: true, message: '請選擇節點計劃' }]}>
          <RaiseSelect /* collapse={collapse} */ options={list} />
        </Form.Item>
      </LoadingView>
    </>
  );
};

export default FormRaises;
