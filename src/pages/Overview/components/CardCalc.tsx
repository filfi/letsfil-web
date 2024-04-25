import { ReactComponent as IconCalc } from '@/assets/icons/calculator.svg';

const CardCalc: React.FC = () => {
  return (
    <>
      <div className="card section-card bg-transparent border-0">
        <div className="card-body d-flex align-items-center gap-3">
          <div className="flex-shrink-0">
            <IconCalc />
          </div>
          <div className="flex-grow-1">
            <h4 className="sider-title mb-1">節點激勵計算器</h4>
            <p className="mb-0">
              <span>年化節點激勵率不準確？</span>
              <a className="stretched-link text-reset" href="#calculator" data-bs-toggle="modal">
                依照您的參數計算
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CardCalc;
