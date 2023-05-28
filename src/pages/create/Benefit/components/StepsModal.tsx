import { useUpdateEffect } from 'ahooks';
import { Form, FormInstance, Input } from 'antd';
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';

import Modal from '@/components/Modal';
import { accDiv, accMul, accSub } from '@/utils/utils';
import { createNumRangeValidator } from '@/utils/validators';

type DivProps = React.HtmlHTMLAttributes<HTMLDivElement>;

type StepFormProps = {
  ops?: number;
  values?: API.Base;
  onFinish?: (vals: API.Base) => void;
};

export type StepsModalProps = DivProps & {
  ops?: number;
  raiser?: number;
  servicer?: number;
  onConfirm?: (vals: { raiser: number; servicer: number }) => void;
};

const getValues = ({ ops = 5, raiser = 70, servicer = 5 }: { ops: number; raiser: number; servicer: number } = {} as any) => {
  const remain = Math.max(accSub(100, raiser), 0);
  const filfi = accMul(remain, 0.08);

  return {
    raiserCoinShare: +raiser,
    raiserCionFirst: accMul(raiser, accDiv(accSub(100, ops), 100)),
    raiserCionLast: accMul(raiser, accDiv(ops, 100)),
    serverShare: remain,
    opServerShare: servicer,
    raiserShare: Math.max(accSub(remain, filfi, servicer), 0),
    filfiShare: filfi,
  };
};

const RaiseForm = forwardRef(({ ops = 5, values, onFinish }: StepFormProps, ref: React.ForwardedRef<FormInstance>) => {
  const [form] = Form.useForm();
  const raiser = Form.useWatch('raiserCoinShare', form);

  useUpdateEffect(() => {
    const servicer = values?.opServerShare ?? 5;
    const amount = Number.isNaN(+raiser) ? 0 : +raiser;

    form.setFieldsValue(getValues({ ops, servicer, raiser: amount }));
  }, [ops, raiser, values?.opServerShare]);

  useImperativeHandle(ref, () => form, [form]);

  const handleFinish = (vals: API.Base) => {
    onFinish?.(vals);
  };

  return (
    <Form form={form} size="large" layout="vertical" initialValues={values} onFinish={handleFinish}>
      <div className="ffi-form">
        <div className="ffi-item px-4 pt-4">
          <p className="mb-1 fw-500">出币方分成</p>
          <Form.Item
            className="mb-0"
            name="raiserCoinShare"
            rules={[{ required: true, message: '请输入' }, { validator: createNumRangeValidator([0, 94.6], '最小0%，最大94.6%') }]}
          >
            <Input type="number" min={0} max={94.6} placeholder="请输入" suffix="%" />
          </Form.Item>
        </div>
        <div className="bg-primary-tertiary px-4 pt-4">
          <div className="row row-cols-1 row-cols-md-2 g-3">
            <div className="col">
              <div className="ffi-item">
                <p className="mb-1 fw-500">投资人分成</p>
                <Form.Item noStyle name="raiserCionFirst">
                  <Input className="bg-light" readOnly suffix="%" />
                </Form.Item>
              </div>
            </div>
            <div className="col">
              <div className="ffi-item">
                <p className="mb-1 fw-500">运维保证金分成</p>
                <Form.Item noStyle name="raiserCionLast">
                  <Input className="bg-light" readOnly suffix="%" />
                </Form.Item>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Form>
  );
});

const ServiceForm = forwardRef(({ ops = 5, values, onFinish }: StepFormProps, ref: React.ForwardedRef<FormInstance>) => {
  const [form] = Form.useForm();
  const servicer = Form.useWatch('opServerShare', form);

  const priorityRate = useMemo(() => values?.raiserCoinShare ?? 70, [values?.raiserCoinShare]);
  const inferRate = useMemo(() => accSub(100, priorityRate), [priorityRate]);
  const raiserRate = useMemo(() => values?.raiserShare ?? 0, [values?.raiserShare]);
  const filfiRate = useMemo(() => values?.filfiShare ?? 0, [values?.filfiShare]);
  const opsMax = useMemo(() => accSub(inferRate, raiserRate, filfiRate), [inferRate, raiserRate, filfiRate]);

  useUpdateEffect(() => {
    const amount = Number.isNaN(+servicer) ? 0 : +servicer;

    form.setFieldsValue(getValues({ ops, raiser: raiserRate, servicer: amount }));
  }, [ops, servicer, raiserRate]);

  useImperativeHandle(ref, () => form, [form]);

  const handleFinish = (vals: API.Base) => {
    onFinish?.(vals);
  };

  return (
    <Form form={form} size="large" layout="vertical" initialValues={values} onFinish={handleFinish}>
      <div className="ffi-form">
        <div className="ffi-item px-4 pt-4">
          <p className="mb-1 fw-500">建设方分成</p>
          <Form.Item noStyle name="serverShare">
            <Input className="bg-light" readOnly suffix="%" />
          </Form.Item>
        </div>
        <div className="px-4 pt-4 bg-primary-tertiary">
          <div className="row row-cols-1 row-cols-md-3 g-3">
            <div className="col">
              <div className="ffi-item mb-0">
                <p className="mb-1 fw-500">技术运维服务费</p>
                <Form.Item
                  className="mb-0"
                  name="opServerShare"
                  rules={[{ required: true, message: '请输入' }, { validator: createNumRangeValidator([5, opsMax], '最小5%，最大100%') }]}
                >
                  <Input type="number" min={5} max={opsMax} placeholder="请输入" suffix="%" />
                </Form.Item>
              </div>
            </div>
            <div className="col">
              <div className="ffi-item mb-0">
                <p className="mb-1 fw-500">发起人分成</p>
                <Form.Item noStyle name="raiserShare">
                  <Input className="bg-light" readOnly suffix="%" />
                </Form.Item>
              </div>
            </div>
            <div className="col">
              <div className="ffi-ite mb-0">
                <p className="mb-1 fw-500">FilFi协议分成</p>
                <Form.Item className="mb-0" name="filfiShare" help="服务商 * 8%">
                  <Input className="bg-light" readOnly suffix="%" />
                </Form.Item>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Form>
  );
});

const StepsModalRender: React.ForwardRefRenderFunction<ModalAttrs, StepsModalProps> = (
  { ops = 5, raiser = 70, servicer = 5, onConfirm, ...props },
  ref?: React.Ref<ModalAttrs> | null,
) => {
  const modal = useRef<ModalAttrs>(null);
  const raiseForm = useRef<FormInstance>(null);
  const serviceForm = useRef<FormInstance>(null);

  const [step, setStep] = useState(0);
  const [values, setValues] = useState(getValues());

  useUpdateEffect(() => {
    const vals = getValues({ ops, raiser, servicer });
    setValues({ ...vals });

    raiseForm.current?.setFieldsValue(vals);
    serviceForm.current?.setFieldsValue(vals);
  }, [ops, raiser, servicer]);

  useImperativeHandle(
    ref,
    () => ({
      hide: () => modal.current?.hide(),
      show: () => modal.current?.show(),
      toggle: () => modal.current?.toggle(),
    }),
    [],
  );

  const handlePrev = async () => {
    setStep(0);
  };

  const handleNext = async () => {
    const form = [raiseForm, serviceForm][step];

    form?.current?.submit();
  };

  const handleFinish = (vals: API.Base) => {
    const _vals = { ...values, ...vals };
    const { raiserCoinShare, opServerShare } = _vals;

    setValues(getValues({ ops, raiser: raiserCoinShare, servicer: opServerShare }));

    if (step === 0) {
      setStep(1);
      return;
    }

    modal.current?.hide();

    onConfirm?.({ raiser: raiserCoinShare, servicer: opServerShare });
  };

  const handleHidden = () => {
    handlePrev();
  };

  const renderFooter = () => {
    return (
      <>
        <p className="text-gray">
          <span className="bi bi-info-circle"></span>
          <span className="ms-2">不可修改字段会自动计算</span>
        </p>

        {step === 0 ? (
          <button type="button" className="btn btn-primary" onClick={handleNext}>
            下一步
          </button>
        ) : (
          <div className="d-flex gap-3">
            <button type="button" className="btn btn-light" onClick={handlePrev}>
              重新分配
            </button>
            <button type="button" className="btn btn-primary" onClick={handleNext}>
              完成
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <Modal
      ref={modal}
      icon="edit"
      title="如何分配收益? "
      bodyClassName="p-0"
      footerClassName="justify-content-between"
      onHidden={handleHidden}
      renderFooter={renderFooter}
      {...props}
    >
      {step === 0 ? (
        <RaiseForm ref={raiseForm} ops={ops} values={values} onFinish={handleFinish} />
      ) : (
        <ServiceForm ref={serviceForm} ops={ops} values={values} onFinish={handleFinish} />
      )}
    </Modal>
  );
};

const StepsModal = forwardRef(StepsModalRender);

export default StepsModal;
