import classNames from 'classnames';

import './styles.less';
import { isFn } from '@/utils/utils';

export type Data = {
  [key: string]: any;
  label: string;
  key?: React.Key;
  children?: Data[];
};

export type OrgTreeProps<TData extends Data = Data> = {
  data: TData;
  className?: classNames.Argument;
  nodeClassName?: classNames.Argument | ((data: TData) => classNames.Argument);
  renderContent?: (data: TData) => React.ReactNode;
};

const OrgTree: React.FC<OrgTreeProps> = ({ data, className, nodeClassName, renderContent }) => {
  const renderTreeNode = (data: Data) => {
    const cls = isFn(nodeClassName) ? nodeClassName(data) : nodeClassName;
    const hasChildren = Array.isArray(data.children) && data.children.length > 0;

    return (
      <div className={classNames('org-tree-node', { 'is-leaf': !hasChildren }, cls)}>{renderContent ? renderContent(data) : <span>{data.label}</span>}</div>
    );
  };

  const renderSubTree = (data?: Data, key?: React.Key) => {
    if (!data) return;

    const hasChildren = Array.isArray(data.children) && data.children.length > 0;

    return (
      <ul key={data?.key ?? key} className="org-tree-subtree">
        <li className="org-tree-cell">{renderTreeNode(data)}</li>
        {hasChildren && <li className="org-tree-cell">{data.children?.map(renderSubTree)}</li>}
      </ul>
    );
  };

  return <div className={classNames('org-tree', className)}>{renderSubTree(data)}</div>;
};

export default OrgTree;
