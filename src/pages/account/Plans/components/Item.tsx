import MountItem from './MountItem';
import RaiseItem from './RaiseItem';
import { isMountPlan } from '@/helpers/mount';

const Item: React.FC<{
  data: API.Plan;
  role?: number;
  onEdit?: () => void;
  onHide?: () => Promise<any>;
  onDelete?: () => Promise<any>;
  onStart?: () => Promise<any>;
}> = ({ data, ...props }) => {
  if (isMountPlan(data)) {
    return <MountItem data={data} {...props} />;
  }

  return <RaiseItem data={data} {...props} />;
};

export default Item;
