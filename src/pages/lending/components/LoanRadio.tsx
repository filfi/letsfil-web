import { Form } from 'antd';

import FormRadio from '@/components/FormRadio';

export type LoanRadioProps = {
  name: string;
};

const LoanRadio: React.FC<LoanRadioProps> = ({ name }) => {
  const options = [
    {
      label: '借款封裝',
      desc: '從“建設池”借款參與節點計劃',
      icon: <span className="bi bi-layers"></span>,
      value: 1,
    },
    {
      disabled: true,
      label: '借款提現',
      desc: '從“自由池”借款提現（開發中）',
      icon: <span className="bi bi-layers"></span>,
      value: 2,
    },
  ];

  const unCheckedIcon = () => <span className="bi bi-circle"></span>;
  const checkedIcon = () => <span className="bi bi-check-circle-fill"></span>;

  return (
    <>
      <Form.Item name={name} noStyle>
        <FormRadio grid items={options} extra={({ checked }) => (checked ? checkedIcon() : unCheckedIcon())} />
      </Form.Item>
    </>
  );
};

export default LoanRadio;
