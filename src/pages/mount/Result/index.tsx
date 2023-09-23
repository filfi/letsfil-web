import { camelCase } from 'lodash';
import { useUnmount } from 'ahooks';
import { useMemo, useRef } from 'react';
import { Link, history, useModel, useParams } from '@umijs/max';

import * as A from '@/apis/raise';
import * as H from '@/helpers/app';
import Result from '@/components/Result';
import SpinBtn from '@/components/SpinBtn';
import { toastify } from '@/utils/hackify';
import useLoadingify from '@/hooks/useLoadingify';
import { ReactComponent as IconEdit } from '@/assets/step-edit.svg';
import { ReactComponent as IconSafe } from '@/assets/step-safe.svg';

export default function MountResult() {
  const params = useParams();
  const clearable = useRef(true);
  const [, setModel] = useModel('stepform');
  const raiseId = useMemo(() => params.id, [params.id]);

  const [loading, handleEdit] = useLoadingify(
    toastify(async () => {
      if (!raiseId) return;

      const data = await A.getInfo(raiseId);

      const model = Object.keys(data).reduce(
        (d, key) => ({
          ...d,
          [camelCase(key)]: data[key as keyof typeof data],
        }),
        {} as API.Base,
      );

      const res = await A.getEquity(data.raising_id, { page: 1, page_size: 1000 });

      setModel({
        ...H.transformModel(model),
        sponsors: H.parseSponsors(res.list),
        investors: H.parseInvestors(res.list),
      });

      clearable.current = false;

      history.replace('/mount');
    }),
  );

  useUnmount(() => {
    if (clearable.current) setModel(undefined);
  });

  return (
    <>
      <div className="ffi-form">
        <Result title="已保存" />

        <div className="ffi-item">
          <h5 className="ffi-label mb-5">
            <span>接下来做什么？</span>
            {/* <a className="text-underline" href="#more-modal" data-bs-toggle="modal">
              了解更多
            </a> */}
          </h5>

          <ul className="list-group list-group-flush text-main" role="group">
            <li className="list-group-item d-flex gap-3 border-0 mb-3">
              <div className="flex-shrink-0">
                <IconEdit />
              </div>
              <div className="flex-grow-1">
                <p className="mb-0">
                  <span className="fw-bold">主办人</span>
                  <span>签名</span>
                </p>
                <p className="mb-0 text-gray-dark">仍可以返回修改计划的参数，主办人签名后，计划上链，所有参数不可修改。</p>
              </div>
            </li>
            <li className="list-group-item d-flex gap-3 border-0 mb-3">
              <div className="flex-shrink-0">
                <IconSafe />
              </div>
              <div className="flex-grow-1">
                <p className="mb-0">
                  <span className="fw-bold">建设者</span>
                  <span>签名</span>
                </p>
                <p className="mb-0 text-gray-dark">分配计划中的每个建设者需要签名，确认自己的分配比例。把分配计划页面分享给建设者。</p>
              </div>
            </li>
            <li className="list-group-item d-flex gap-3 border-0 mb-3">
              <div className="flex-shrink-0">
                <IconEdit />
              </div>
              <div className="flex-grow-1">
                <p className="mb-0">
                  <span className="fw-bold">技术服务商</span>
                  <span>签名</span>
                </p>
                <p className="mb-0 text-gray-dark">分配计划需要获得技术服务商的签名，同时移交Owner地址给FilFi智能合约。把分配计划页面分享给技术服务商</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-top my-4"></div>

      <div className="ffi-form">
        <div className="d-flex gap-3 gap-lg-4">
          <SpinBtn className="btn btn-light btn-lg flex-shrink-0" loading={loading} onClick={handleEdit}>
            重新修改
          </SpinBtn>
          <Link className="btn btn-primary btn-lg flex-fill" replace to={`/overview/${raiseId}`}>
            查看分配计划
          </Link>
        </div>
      </div>
    </>
  );
}
