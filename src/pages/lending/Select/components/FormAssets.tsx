import { useMemo } from 'react';
import { Form, Input } from 'antd';
import { useBoolean, useDebounceEffect, useRequest, useUpdateEffect } from 'ahooks';
import type { FormInstance } from 'antd';

// import { accMul } from '@/utils/utils';
import AssetSelect from './AssetSelect';
import { listLoans } from '@/apis/packs';
import LoadingView from '@/components/LoadingView';
import useRetrieverContract from '@/hooks/useRetrieverContract';

type AssetItem = {
  id: string;
  minerId: string;
  pledge: number;
  avaialable: number;
};

const FormAssets: React.FC<{
  account?: string;
  form: FormInstance;
  name: string;
  onDataChange?: (list: any[]) => void;
}> = ({ account, form, name, onDataChange }) => {
  const aid = Form.useWatch(name, form);

  const { getPledgeList } = useRetrieverContract();
  const service = async () => {
    if (account) {
      const data = await listLoans({ address: account, page_size: 1000 });

      if (Array.isArray(data.list) && data.list.length) {
        const ids = data.list.map((i) => i.raising_id);
        const list = await getPledgeList(account, ids);

        return data.list
          .map<AssetItem>((m, i) => ({
            id: m.raising_id,
            // pledge: list[0][i],
            // avaialable: list[0][i],
            pledge: list[1][i],
            avaialable: list[1][i],
            minerId: m.miner_id,
          }))
          .sort((a, b) => (b.avaialable ?? 0) - (a.avaialable ?? 0));
      }
    }
  };

  const [collapse, { setFalse }] = useBoolean(Boolean(form.getFieldValue(name)));
  const { data, error, loading, refresh } = useRequest(service, { refreshDeps: [account] });

  const list = useMemo(() => data?.filter((i) => i.avaialable > 0) ?? [], [data]);
  const total = useMemo(() => list.length, [list]);

  useUpdateEffect(() => {
    onDataChange?.(list);
  }, [list]);

  useDebounceEffect(() => {
    const item = list?.find((i) => i.id === aid);

    if (item) {
      form.setFieldsValue({
        minerId: item.minerId,
        loanPledge: item.pledge,
        loanAvaialable: item.avaialable,
      });
    }
  }, [aid, list]);

  return (
    <>
      <div className="d-flex align-items-center mb-1">
        <div className="flex-fill me-3">
          <h5 className="mb-0 fw-600">選擇抵押資產</h5>
        </div>

        {total > 3 && collapse && (
          <button className="btn btn-link p-0 text-reset fw-600" type="button" onClick={() => setFalse()}>
            顯示全部 {total} 條資產
          </button>
        )}
      </div>
      <p className="mb-3 text-gray">選擇一項資產做為抵押物</p>

      <LoadingView
        className=""
        data={list}
        error={!!error}
        loading={loading}
        emptyTitle="暫無可抵押資產"
        retry={refresh}
      >
        <Form.Item hidden name="minerId">
          <Input />
        </Form.Item>
        <Form.Item hidden name="loanPledge">
          <Input />
        </Form.Item>
        <Form.Item hidden name="loanAvaialable">
          <Input />
        </Form.Item>

        <Form.Item name={name} rules={[{ required: true, message: '請選擇抵押資產' }]}>
          <AssetSelect collapse={collapse} options={list} />
        </Form.Item>
      </LoadingView>
    </>
  );
};

export default FormAssets;
