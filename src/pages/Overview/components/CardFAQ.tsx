import Modal from '@/components/Modal';

const CardFAQ: React.FC = () => {
  return (
    <>
      <div className="card section-card bg-transparent border-0">
        <div className="card-body">
          <h3 className="sider-title">FAQ</h3>

          <dl className="mb-0">
            <dt className="card-title">质押节点计划是否有额外成本？</dt>
            <dd>
              <span>转入FIL时会产生Filecoin网络的Gas费。如果节点计划失败，主办人保证金将用来赔偿建设者的利息损失。</span>
              <a className="text-underline" href="#faq-modal" data-bs-toggle="modal">
                了解更多
              </a>
            </dd>
            <dt className="card-title">质押节点计划的FIL能否转出？</dt>
            <dd>目前投入节点计划的FIL即被锁定在智能合约，最终会做为质押投入存储的建设。在质押到期前无法转出，但是会按照分成比例获得Filecoin的网络奖励。</dd>
          </dl>
        </div>
      </div>

      <Modal.Alert id="faq-modal" title="FAQ" titleClassName="fw-bold" confirmText="我知道了">
        <div className="card border-0">
          <div className="card-body">
            <dl className="mb-0">
              <dt className="card-title">质押节点计划是否有额外成本？</dt>
              <dd>转入FIL时会产生Filecoin网络的Gas费。如果节点计划失败，主办人保证金将用来赔偿建设者的利息损失。</dd>
              <dt className="card-title">质押节点计划的FIL能否转出？</dt>
              <dd>目前投入节点计划的FIL即被锁定在智能合约，最终会做为质押投入存储的建设。在质押到期前无法转出，但是会按照分成比例获得Filecoin的网络奖励。</dd>
            </dl>
          </div>
        </div>
      </Modal.Alert>
    </>
  );
};

export default CardFAQ;
