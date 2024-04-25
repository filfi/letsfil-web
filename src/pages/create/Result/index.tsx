import dayjs from 'dayjs';
import { camelCase } from 'lodash';
import { useUnmount } from 'ahooks';
import { useMemo, useRef } from 'react';
import { Link, history, useModel, useParams } from '@umijs/max';

import * as A from '@/apis/raise';
import * as H from '@/helpers/app';
import Result from '@/components/Result';
import { toastify } from '@/utils/hackify';
import SpinBtn from '@/components/SpinBtn';
import useLoadingify from '@/hooks/useLoadingify';
import { ReactComponent as IconEdit } from '@/assets/step-edit.svg';
import { ReactComponent as IconSafe } from '@/assets/step-safe.svg';

export default function CreateResult() {
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

      if (model.beginTime > 0) {
        model.beginTime = dayjs.unix(model.beginTime).format('YYYY-MM-DD HH:mm:ss');
      } else {
        model.beginTime = '';
      }

      const res = await A.getEquity(raiseId, { page: 1, page_size: 1000 });

      setModel({
        ...H.transformModel(model),
        sponsors: H.parseSponsors(res.list),
        raiseWhiteList: H.parseWhitelist(model.raiseWhiteList),
      });

      clearable.current = false;

      history.replace('/create');
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
                <p className="mb-0 text-gray-dark">對節點計畫達成共識，主辦人簽名完成鏈上部署，上鍊後不可修改。</p>
              </div>
            </li>
            <li className="list-group-item d-flex gap-3 border-0 mb-3">
              <div className="flex-shrink-0">
                <IconSafe />
              </div>
              <div className="flex-grow-1">
                <p className="mb-0">
                  <span className="fw-bold">主辦人</span>
                  <span>存入”主辦人保證金“</span>
                </p>
                <p className="mb-0 text-gray-dark">封裝結束後，主辦人可取回保證金，保證金原路退回存入時使用的錢包。</p>
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
                  節點計畫需要經過技術服務商簽名確認，同時將儲存節點的Owner交給智慧合約。
                </p>
              </div>
            </li>
            <li className="list-group-item d-flex gap-3 border-0 mb-3">
              <div className="flex-shrink-0">
                <IconSafe />
              </div>
              <div className="flex-grow-1">
                <p className="mb-0">
                  <span className="fw-bold">技術服務商</span>
                  <span>存入“運維保證金”</span>
                </p>
                <p className="mb-0 text-gray-dark">
                  扇區全部到期後，技術服務商可取回保證金，保證金原路退回存入時使用的錢包。
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
            查看節點計劃
          </Link>
        </div>
      </div>
    </>
  );
}
