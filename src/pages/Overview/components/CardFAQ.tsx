import Modal from '@/components/Modal';

const CardFAQ: React.FC = () => {
  return (
    <>
      <div className="card section-card bg-transparent border-0">
        <div className="card-body">
          <h3 className="sider-title">FAQ</h3>

          <dl className="mb-0">
            <dt className="card-title">質押節點計畫是否有額外成本？</dt>
            <dd>
              <span>
                轉入FIL時會產生Filecoin網路的Gas費。如果節點計畫失敗，主辦人保證金將用來賠償建造者的利息損失。
              </span>
              <a className="text-underline" href="#faq-modal" data-bs-toggle="modal">
                了解更多
              </a>
            </dd>
            <dt className="card-title">質押節點計劃的FIL能否轉出？</dt>
            <dd>
              目前投入節點計畫的FIL即被鎖定在智能合約，最終會做為質押投入儲存的建設。在質押到期前無法轉出，但會依照分成比例獲得Filecoin的網路獎勵。
            </dd>
          </dl>
        </div>
      </div>

      <Modal.Alert id="faq-modal" title="FAQ" titleClassName="fw-bold" confirmText="我知道了">
        <div className="card border-0">
          <div className="card-body">
            <dl className="mb-0">
              <dt className="card-title">質押節點計畫是否有額外成本？</dt>
              <dd>轉入FIL時會產生Filecoin網路的Gas費。如果節點計畫失敗，主辦人保證金將用來賠償建造者的利息損失。</dd>
              <dt className="card-title">質押節點計劃的FIL能否轉出？</dt>
              <dd>
                目前投入節點計畫的FIL即被鎖定在智能合約，最終會做為質押投入儲存的建設。在質押到期前無法轉出，但會依照分成比例獲得Filecoin的網路獎勵。
              </dd>
            </dl>
          </div>
        </div>
      </Modal.Alert>
    </>
  );
};

export default CardFAQ;
