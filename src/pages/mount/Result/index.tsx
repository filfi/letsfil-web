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

      const res = await A.getEquity(raiseId, { page: 1, page_size: 1000 });

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
        <Result title="已儲存" />

        <div className="ffi-item">
          <h5 className="ffi-label mb-5">
            <span>接下來做什麼？</span>
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
                  <span className="fw-bold">主辦人</span>
                  <span>簽名</span>
                </p>
                <p className="mb-0 text-gray-dark">
                  仍可以返回修改計畫的參數，主辦人簽名後，計畫上鍊，所有參數不可修改。
                </p>
              </div>
            </li>
            <li className="list-group-item d-flex gap-3 border-0 mb-3">
              <div className="flex-shrink-0">
                <IconSafe />
              </div>
              <div className="flex-grow-1">
                <p className="mb-0">
                  <span className="fw-bold">建設者</span>
                  <span>簽名</span>
                </p>
                <p className="mb-0 text-gray-dark">
                  分配計劃中的每個建設者都需要簽名，確認自己的分配比例。把分配計畫頁面分享給建設者。
                </p>
              </div>
            </li>
            <li className="list-group-item d-flex gap-3 border-0 mb-3">
              <div className="flex-shrink-0">
                <IconEdit />
              </div>
              <div className="flex-grow-1">
                <p className="mb-0">
                  <span className="fw-bold">技術服務商</span>
                  <span>簽名</span>
                </p>
                <p className="mb-0 text-gray-dark">
                  分配計畫需要取得技術服務商的簽名，同時移交Owner位址給FilFi智慧合約。把分配計畫頁面分享給技術服務商
                </p>
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
            查看分配計劃
          </Link>
        </div>
      </div>
    </>
  );
}
