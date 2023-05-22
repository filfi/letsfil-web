import styles from './styles.less';
import { isDef } from '@/utils/utils';
import { ReactComponent as IconSuccess } from '@/assets/icons/success.svg';

export type ResultProps = {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  desc?: React.ReactNode;
  children?: React.ReactNode;
};

const Result: React.FC<ResultProps> = ({ icon, title, desc, children }) => {
  return (
    <>
      <div className={styles.result}>
        <div className="mb-4 mb-lg-5">
          <p className="mb-4">{isDef(icon) ? icon : <IconSuccess />}</p>
          <h4 className="fs-2 fw-bold mb-2">{title}</h4>
          <p className="text-gray">{desc}</p>
        </div>

        {children}
      </div>
    </>
  );
};

export default Result;
