import { Form } from 'antd';
import qs from 'querystring';
import { useMount } from 'ahooks';
import { useMemo, useState } from 'react';
import { history, useLocation, useModel } from '@umijs/max';

import { getInfo } from '@/apis/raise';
import { accAdd } from '@/utils/utils';
import { formatID } from '@/utils/format';
import Dialog from '@/components/Dialog';
import SpinBtn from '@/components/SpinBtn';
import useAccount from '@/hooks/useAccount';
import useContract from '@/hooks/useContract';
import LoanRadio from '../components/LoanRadio';
import FormAssets from './components/FormAssets';
import FormRaises from './components/FormRaises';
import useLoadingify from '@/hooks/useLoadingify';

export default function LendingSelect() {
  const [form] = Form.useForm();
  const location = useLocation();
  const contract = useContract();
  const { address } = useAccount();
  const [model, setModel] = useModel('loanform');

  const [hasAssets, setHasAssets] = useState(false);
  const [hasRaises, setHasRaises] = useState(false);
  const query = useMemo(() => qs.parse(location.search.slice(1)), [location.search]);

  const onAssetsChange = (list: any[]) => {
    setHasAssets(list.length > 0);
  };

  const onRaisesChange = (list: any[]) => {
    setHasRaises(list.length > 0);
  };

  const validateAsset = async (id: string) => {
    if (!address) return false;

    const info = await getInfo(id);
    const back = await contract.getBackAssets(id, address, info.raise_address);
    const reward = await contract.getInvestorAvailableReward(id, address, info.raise_address);

    const available = accAdd(back?.[0] ?? 0, back?.[1] ?? 0, reward ?? 0);

    if (available > 0) {
      Dialog.confirm({
        icon: 'error',
        title: '目前抵押資產有獎勵未提取',
        summary: `目前選取的抵押資產 ${formatID(id)}@${
          info.miner_id
        } 中有未提取的獎勵，您需要先領取獎勵，才能進行抵押操作`,
        confirmText: '前往提取',
        onConfirm: () => {
          history.push(`/assets/overview/${id}`);
        },
      });

      return false;
    }

    return true;
  };

  const [loading, handleSubmit] = useLoadingify(async (vals: API.Base) => {
    if (!vals.assetId || !vals.raiseId) return;

    const valid = await validateAsset(vals.assetId);

    if (!valid) return;

    setModel((d) => ({ ...d, ...vals, address }));

    history.push('/lending/loan');
  });

  useMount(() => {
    setModel(undefined);
  });

  return (
    <>
      <div className="container stake-container py-5">
        <Form
          className="ffi-form"
          form={form}
          size="large"
          initialValues={{
            loanType: 1,
            assetId: query.aid,
            raiseId: query.pid,
            ...model,
          }}
          onFinish={handleSubmit}
        >
          <div className="card stake-card card-body mb-5">
            <LoanRadio name="loanType" />
          </div>

          <div className="ffi-item mb-4">
            <FormAssets form={form} account={address} name="assetId" onDataChange={onAssetsChange} />
          </div>

          <div className="ffi-item mb-4">
            <FormRaises form={form} account={address} name="raiseId" onDataChange={onRaisesChange} />
          </div>

          <p>
            <SpinBtn
              className="btn btn-primary btn-lg w-100"
              type="submit"
              disabled={!hasAssets || !hasRaises}
              loading={loading}
            >
              下一步
            </SpinBtn>
          </p>
        </Form>
      </div>
    </>
  );
}
