import { Form } from 'antd';
import { useUnmount } from 'ahooks';

import LoanRadio from '../components/LoanRadio';
import { Link, useModel } from '@umijs/max';
import { isMountPlan } from '@/helpers/mount';
import useRaiseInfo from '@/hooks/useRaiseInfo';
import { formatAmount, formatID, formatSponsor } from '@/utils/format';
import { ReactComponent as IconSuccess } from '@/assets/icons/success01.svg';

export default function LendingResult() {
  const [form] = Form.useForm();
  const [model, setModel] = useModel('loanform');
  const { data } = useRaiseInfo(model?.raiseId);

  useUnmount(() => setModel(undefined));

  return (
    <>
      <div className="container stake-container py-4">
        <Form
          className="ffi-form"
          form={form}
          size="large"
          initialValues={{
            loanType: 1,
            ...model,
          }}
        >
          <div className="card stake-card card-body mb-4">
            <LoanRadio name="loanType" />
          </div>
        </Form>

        <div className="mb-5 text-center">
          <p className="mb-4">
            <IconSuccess />
          </p>
          <h4 className="mb-4 fs-5 fw-bold">借款 {formatAmount(model?.added)} FIL 成功！</h4>
          <p>
            <Link className="btn btn-light btn-lg" to={`/assets/overview/${model?.assetId}`}>
              返回算力資產({formatID(model?.assetId)}@{model?.minerId})
            </Link>
          </p>
          <p>
            <Link className="btn btn-light btn-lg" to={`/overview/${model?.raiseId}`}>
              <span>返回</span>
              {isMountPlan(data) ? (
                <span>
                  {formatSponsor(data?.sponsor_company)}掛載節點@{data?.miner_id}
                </span>
              ) : (
                <span>
                  節點計劃({formatSponsor(data?.sponsor_company)}發起的節點計劃@{data?.miner_id})
                </span>
              )}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
