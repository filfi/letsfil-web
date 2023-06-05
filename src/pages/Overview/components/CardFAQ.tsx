import Modal from '@/components/Modal';

const CardFAQ: React.FC<{ data?: API.Plan }> = ({}) => {
  return (
    <>
      <div className="card section-card bg-transparent border-0">
        <div className="card-body">
          <h3 className="sider-title">FAQ</h3>

          <dl className="mb-0">
            <dt className="card-title">参与募集计划是否有额外成本？</dt>
            <dd>
              <span>转入FIL时会产生Filecoin网络的Gas费。如果募集计划失败，发起方的发起人保证金将用来赔偿投资人的利息损失。</span>
              <a className="text-underline" href="#faq-modal" data-bs-toggle="modal">
                了解更多
              </a>
            </dd>
            <dt className="card-title">参与募集计划的FIL能否转出？</dt>
            <dd>目前投入募集计划的FIL即被锁定在智能合约，最终会做为质押币投入存储的建设。在质押币到期前无法转出，但是会按照分成比例获得Filecoin的网络奖励。</dd>
          </dl>
        </div>
      </div>

      <Modal.Alert id="faq-modal" title="FAQ" titleClassName="fw-bold" confirmText="我知道了">
        <div className="card border-0">
          <div className="card-body">
            <dl className="mb-0">
              <dt className="card-title">参与募集计划是否有额外成本？</dt>
              <dd>转入FIL时会产生Filecoin网络的Gas费。如果募集计划失败，发起方的发起人保证金将用来赔偿投资人的利息损失。</dd>
              <dt className="card-title">参与募集计划的FIL能否转出？</dt>
              <dd>
                目前投入募集计划的FIL即被锁定在智能合约，最终会做为质押币投入存储的建设。在质押币到期前无法转出，但是会按照分成比例获得Filecoin的网络奖励。
              </dd>
            </dl>
          </div>
        </div>
      </Modal.Alert>
    </>
  );
};

export default CardFAQ;
