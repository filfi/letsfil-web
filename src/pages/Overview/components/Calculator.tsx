import classNames from 'classnames';

import { Form, Input, Select } from 'antd';

const Calculator: React.FC = () => {
  const [form] = Form.useForm();

  const handleCalc = async (vals: any) => {
    console.log(vals);
  };

  return (
    <>
      <div id="calculator" className={classNames('modal fade calculator')} tabIndex={-1} aria-hidden="true" aria-labelledby="modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header flex-column">
              <button type="button" className="btn-close position-absolute end-0 top-0 me-3 mt-3" data-bs-dismiss="modal" aria-label="Close"></button>

              <p className="ms-auto pe-5 me-5 mb-2 text-end text-neutral fw-500">年化节点激励率</p>

              <div className="d-flex w-100">
                <div className="flex-shrink-0 mt-auto mb-2">
                  <span className="px-2 py-1 border border-2 border-primary rounded fw-600 lh-1 text-primary">32G</span>
                </div>
                <div className="flex-grow-1 ms-3 lh-1 text-end">
                  <span className="display-4 lh-1 fw-600">0.0</span>
                  <span className="fs-5 fw-600 text-neutral ms-2">%</span>
                </div>
              </div>
            </div>

            <Form form={form} className="w-100" layout="vertical" size="large" onFinish={handleCalc}>
              <div className="modal-body pb-0">
                <div className="row g-3 g-lg-4">
                  <div className="col-12 col-md-8 col-lg-6 offset-md-4 offset-lg-6">
                    <Form.Item name="amount">
                      <Input
                        className="fs-3"
                        placeholder="输入投资额"
                        size="large"
                        suffix={<span className="mt-auto mb-2 fs-5 small lh-1 text-gray">FIL</span>}
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              <div className="modal-body border-top">
                <div className="row row-cols-1 row-cols-md-2 g-0 g-md-3 g-lg-4">
                  <div className="col d-flex flex-column">
                    <Form.Item label="集合质押金额" name="total">
                      <Input placeholder="输入集合质押金额" suffix="FIL" />
                    </Form.Item>

                    <div className="row row-cols-2 order-md-2">
                      <div className="col">
                        <Form.Item label="24h平均节点激励/T" name="perPower">
                          <Input placeholder="输入24h平均节点激励/T" suffix="FIL/TiB" />
                        </Form.Item>
                      </div>
                      <div className="col">
                        <Form.Item label="扇区期限" name="period">
                          <Select
                            placeholder="请选择"
                            dropdownStyle={{ zIndex: 1100 }}
                            options={[
                              { label: '210天', value: 210 },
                              { label: '360天', value: 360 },
                              { label: '540天', value: 540 },
                            ]}
                          />
                        </Form.Item>
                      </div>
                    </div>

                    <Form.Item className="order-md-1" label="总算力(QAP)">
                      <Input className="border-0" readOnly value={0.0} suffix="PiB" />
                    </Form.Item>
                  </div>

                  <div className="col">
                    <Form.Item label="总节点激励">
                      <Input className="border-0 text-end" readOnly value={0.0} suffix="FIL" />
                    </Form.Item>

                    <div className="row row-cols-2">
                      <div className="col">
                        <Form.Item label="建设者获得">
                          <Input className="border-0 text-end" readOnly value={0.0} suffix="%" />
                        </Form.Item>
                      </div>
                      <div className="col">
                        <Form.Item label="我的分成比例">
                          <Input className="border-0 text-end" readOnly value={0.0} suffix="%" />
                        </Form.Item>
                      </div>
                    </div>

                    <div className="row row-cols-2">
                      <div className="col">
                        <Form.Item label="建设者节点激励">
                          <Input className="border-0 text-end" readOnly value={0.0} suffix="FIL" />
                        </Form.Item>
                      </div>
                      <div className="col">
                        <Form.Item label="我的节点激励">
                          <Input className="border-0 text-end" readOnly value={0.0} suffix="FIL" />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer justify-content-between">
                <span className="text-gray">
                  <i className="bi bi-clock align-middle"></i>

                  <span className="ms-2 align-middle">24h平均节点激励/T</span>
                  <span className="ms-3 fw-500 align-middle">3小时前</span>
                </span>

                <button className="btn btn-outline-danger border-0" type="reset">
                  重置
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Calculator;
