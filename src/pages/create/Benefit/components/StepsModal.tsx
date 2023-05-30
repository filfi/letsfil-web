import { useUpdateEffect } from 'ahooks';
import { Form, FormInstance, Input } from 'antd';
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';

import Modal from '@/components/Modal';
import { calcEachEarn } from '@/helpers/app';
import { accMul, accSub } from '@/utils/utils';
import { createNumRangeValidator } from '@/utils/validators';

type DivProps = React.HtmlHTMLAttributes<HTMLDivElement>;
type Values = ReturnType<typeof calcEachEarn>;

type StepFormProps = {
  values?: Values;
  onFinish?: (vals: Values) => void;
};

export type StepsModalProps = DivProps & {
  ratio?: number; // 运维保证金配比
  spRate?: number; // 技术服务商权益
  priority?: number; // 出币方权益（优先部分）
  onConfirm?: (vals: Values) => void;
};

const RaiseForm = forwardRef(({ values, onFinish }: StepFormProps, ref: React.ForwardedRef<FormInstance>) => {
  const [form] = Form.useForm<Values>();
  const amount = Form.useWatch('priority', form);

  useUpdateEffect(() => {
    const { spRate = 5, ratio = 5 } = values ?? {};
    const priority = Number.isNaN(+amount) ? 0 : +amount;

    form.setFieldsValue(calcEachEarn(priority, spRate, ratio));
  }, [amount, values]);

  useImperativeHandle(ref, () => form, [form]);

  const handleFinish = (vals: Values) => {
    onFinish?.(vals);
  };

  return (
    <Form form={form} size="large" layout="vertical" initialValues={values} onFinish={handleFinish}>
      <div className="ffi-form">
        <div className="ffi-item px-4 pt-4">
          <p className="mb-1 fw-500">出币方分成</p>
          <Form.Item
            className="mb-0"
            name="priority"
            rules={[{ required: true, message: '请输入' }, { validator: createNumRangeValidator([0, 94.56], '最小0%，最大94.56%') }]}
          >
            <Input type="number" min={0} max={94.56} placeholder="请输入" suffix="%" />
          </Form.Item>
        </div>
        <div className="bg-primary-tertiary px-4 pt-4">
          <div className="row row-cols-1 row-cols-md-2 g-3">
            <div className="col">
              <div className="ffi-item">
                <p className="mb-1 fw-500">投资人分成</p>
                <Form.Item noStyle name="investRate">
                  <Input className="bg-light" readOnly suffix="%" />
                </Form.Item>
              </div>
            </div>
            <div className="col">
              <div className="ffi-item">
                <p className="mb-1 fw-500">运维保证金分成</p>
                <Form.Item noStyle name="opsRate">
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

const ServiceForm = forwardRef(({ values, onFinish }: StepFormProps, ref: React.ForwardedRef<FormInstance>) => {
  const [form] = Form.useForm();
  const amount = Form.useWatch('spRate', form);

  const inferior = useMemo(() => values?.inferior ?? 30, [values?.inferior]);
  const ffiRate = useMemo(() => values?.ffiRate ?? accMul(inferior, 0.08), [values?.ffiRate, inferior]);
  const opsMax = useMemo(() => Math.max(accSub(inferior, ffiRate), 0), [inferior, ffiRate]);

  useUpdateEffect(() => {
    const { priority = 70, ratio = 5 } = values ?? {};
    const spRate = Number.isNaN(+amount) ? 0 : +amount;

    form.setFieldsValue(calcEachEarn(priority, spRate, ratio));
  }, [amount, values]);

  useImperativeHandle(ref, () => form, [form]);

  const handleFinish = (vals: Values) => {
    onFinish?.(vals);
  };

  return (
    <Form form={form} size="large" layout="vertical" initialValues={values} onFinish={handleFinish}>
      <div className="ffi-form">
        <div className="ffi-item px-4 pt-4">
          <p className="mb-1 fw-500">建设方分成</p>
          <Form.Item noStyle name="inferior">
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
                  name="spRate"
                  rules={[{ required: true, message: '请输入' }, { validator: createNumRangeValidator([5, opsMax], `最小5%，最大${opsMax}%`) }]}
                >
                  <Input type="number" min={5} max={opsMax} placeholder="请输入" suffix="%" />
                </Form.Item>
              </div>
            </div>
            <div className="col">
              <div className="ffi-item mb-0">
                <p className="mb-1 fw-500">发起人分成</p>
                <Form.Item noStyle name="raiserRate">
                  <Input className="bg-light" readOnly suffix="%" />
                </Form.Item>
              </div>
            </div>
            <div className="col">
              <div className="ffi-ite mb-0">
                <p className="mb-1 fw-500">FilFi协议分成</p>
                <Form.Item className="mb-0" name="ffiRate" help="服务商 * 8%">
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
  { priority = 70, spRate = 5, ratio = 5, onConfirm, ...props },
  ref?: React.Ref<ModalAttrs> | null,
) => {
  const modal = useRef<ModalAttrs>(null);
  const raiseForm = useRef<FormInstance>(null);
  const serviceForm = useRef<FormInstance>(null);

  const [step, setStep] = useState(0);
  const [values, setValues] = useState(calcEachEarn(priority, spRate, ratio));

  useUpdateEffect(() => {
    const vals = calcEachEarn(priority, spRate, ratio);
    setValues({ ...vals });

    raiseForm.current?.setFieldsValue(vals);
    serviceForm.current?.setFieldsValue(vals);
  }, [priority, spRate, ratio]);

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
    const { priority, spRate } = _vals;

    setValues(calcEachEarn(priority, spRate, ratio));

    if (step === 0) {
      setStep(1);
      return;
    }

    modal.current?.hide();

    onConfirm?.(_vals);
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
        <RaiseForm ref={raiseForm} values={values} onFinish={handleFinish} />
      ) : (
        <ServiceForm ref={serviceForm} values={values} onFinish={handleFinish} />
      )}
    </Modal>
  );
};

const StepsModal = forwardRef(StepsModalRender);

export default StepsModal;
