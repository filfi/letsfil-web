import { ReactComponent as IconCalc } from '@/assets/icons/calculator.svg';
import type { ItemProps } from './types';

const CardCalc: React.FC<ItemProps> = ({}) => {
  return (
    <>
      <div className="card section-card bg-transparent border-0">
        <div className="card-body d-flex align-items-center gap-3">
          <div className="flex-shrink-0">
            <IconCalc />
          </div>
          <div className="flex-grow-1">
            <h4 className="sider-title mb-1">节点激励计算器</h4>
            <p className="mb-0">
              <span>年化节点激励率不准确？</span>
              <a className="stretched-link text-reset" href="#calculator" data-bs-toggle="modal">
                按照您的参数计算
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CardCalc;
