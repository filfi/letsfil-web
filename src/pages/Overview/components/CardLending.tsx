import { Link, useModel } from '@umijs/max';

import { isMountPlan } from '@/helpers/mount';
import useMountState from '@/hooks/useMountState';
import { ReactComponent as IconTrans } from '@/assets/icons/trans.svg';

const renderContent = (id: string) => {
  return (
    <>
      <Link className="card section-card sticky-card bg-white border-0 shadow-sm" to={`/lending/select?pid=${id}`}>
        <div className="card-body d-flex align-items-center gap-3">
          <div className="flex-shrink-0">
            <IconTrans />
          </div>
          <div className="flex-grow-1">
            <h4 className="sider-title mb-1">抵押資產再投入</h4>
            <p className="mb-0">抵押資產借入FIL，再投入流動性質押</p>
          </div>
        </div>
      </Link>
    </>
  );
};

const MountLending: React.FC = () => {
  const { plan } = useModel('Overview.overview');
  const { isActive, isWorking, isDone } = useMountState(plan);

  if (!plan) return null;

  if (isActive || isWorking || isDone) {
    return renderContent(plan.raising_id);
  }

  return null;
};

const RaiseLending: React.FC = () => {
  const { plan, state } = useModel('Overview.overview');

  if (!plan) return null;

  if (state.isRaising || state.isDelayed || state.isSealing || state.isWorking) {
    return renderContent(plan.raising_id);
  }

  return null;
};

const CardLending: React.FC = () => {
  const { plan } = useModel('Overview.overview');

  if (isMountPlan(plan)) {
    return <MountLending />;
  }

  return <RaiseLending />;
};

export default CardLending;
