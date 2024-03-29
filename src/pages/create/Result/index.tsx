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
                <p className="mb-0 text-gray-dark">对节点计划达成共识，主办人签名完成链上部署，上链之后不可修改。</p>
              </div>
            </li>
            <li className="list-group-item d-flex gap-3 border-0 mb-3">
              <div className="flex-shrink-0">
                <IconSafe />
              </div>
              <div className="flex-grow-1">
                <p className="mb-0">
                  <span className="fw-bold">主办人</span>
                  <span>存入”主办人保证金“</span>
                </p>
                <p className="mb-0 text-gray-dark">封装结束后，主办人可取回保证金，保证金原路退回存入时使用的钱包。</p>
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
                <p className="mb-0 text-gray-dark">节点计划需要得到技术服务商签名确认，同时将存储节点的Owner交给智能合约。</p>
              </div>
            </li>
            <li className="list-group-item d-flex gap-3 border-0 mb-3">
              <div className="flex-shrink-0">
                <IconSafe />
              </div>
              <div className="flex-grow-1">
                <p className="mb-0">
                  <span className="fw-bold">技术服务商</span>
                  <span>存入”运维保证金“</span>
                </p>
                <p className="mb-0 text-gray-dark">扇区全部到期后，技术服务商可取回保证金，保证金原路退回存入时使用的钱包。</p>
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
            查看节点计划
          </Link>
        </div>
      </div>
    </>
  );
}
