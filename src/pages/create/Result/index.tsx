import { camelCase } from 'lodash';
import { useUnmount } from 'ahooks';
import { useMemo, useRef } from 'react';
import { Link, history, useModel, useParams } from '@umijs/max';

import * as A from '@/apis/raise';
import Modal from '@/components/Modal';
import Result from '@/components/Result';
import { toastify } from '@/utils/hackify';
import SpinBtn from '@/components/SpinBtn';
import { transformModel } from '@/helpers/app';
import useLoadingify from '@/hooks/useLoadingify';
import { ReactComponent as IconEdit } from '@/assets/step-edit.svg';
import { ReactComponent as IconSafe } from '@/assets/step-safe.svg';
import { ReactComponent as IconLaunch } from '@/assets/step-launch.svg';

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
        {},
      );

      setModel(transformModel(model));

      clearable.current = false;

      history.replace('/create');
    }),
  );

  useUnmount(() => {
    if (clearable.current) setModel(undefined);
  });

  return (
    <>
      <div className="letsfil-form">
        <Result title="已保存" />

        <div className="letsfil-item">
          <h5 className="letsfil-label mb-5">
            <span>接下来做什么？</span>
            <a className="text-underline" href="#more-modal" data-bs-toggle="modal">
              了解更多
            </a>
          </h5>

          <ul className="list-group list-group-flush text-main" role="group">
            <li className="list-group-item d-flex gap-3 border-0 mb-3">
              <div className="flex-shrink-0">
                <IconEdit />
              </div>
              <div className="flex-grow-1">
                <p className="mb-0">
                  <span className="fw-bold">发起人</span>
                  <span>签名</span>
                </p>
                <p className="mb-0 text-gray-dark">与您的合作伙伴讨论充分募集计划，签名将完成链上部署，上链之后不可修改。</p>
              </div>
            </li>
            <li className="list-group-item d-flex gap-3 border-0 mb-3">
              <div className="flex-shrink-0">
                <IconSafe />
              </div>
              <div className="flex-grow-1">
                <p className="mb-0">
                  <span className="fw-bold">发起人</span>
                  <span>存入”发起人保证金“</span>
                </p>
                <p className="mb-0 text-gray-dark">封装结束后，发起人可取回保证金，保证金原路退回存入时使用的钱包。</p>
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
                <p className="mb-0 text-gray-dark">募集计划需要得到技术服务商签名确认，同时将存储节点的Owner交给智能合约。</p>
              </div>
            </li>
            <li className="list-group-item d-flex gap-3 border-0 mb-3">
              <div className="flex-shrink-0">
                <IconSafe />
              </div>
              <div className="flex-grow-1">
                <p className="mb-0">
                  <span className="fw-bold">技术服务商</span>
                  <span>存入”技术运维保证金“</span>
                </p>
                <p className="mb-0 text-gray-dark">扇区全部到期后，技术服务商可取回保证金，保证金原路退回存入时使用的钱包。</p>
              </div>
            </li>
            <li className="list-group-item d-flex gap-3 border-0 mb-3">
              <div className="flex-shrink-0">
                <IconLaunch />
              </div>
              <div className="flex-grow-1">
                <p className="mb-0">
                  <span className="fw-bold">发起人</span>
                  <span>启动</span>
                </p>
                <p className="mb-0 text-gray-dark">满足所有条件后，启动按钮生效，发起人决定启动时间，启动后募集期开始计时。</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-top my-4"></div>

      <div className="letsfil-form">
        <div className="d-flex gap-3 gap-lg-4">
          <SpinBtn className="btn btn-light btn-lg flex-shrink-0" loading={loading} onClick={handleEdit}>
            重新修改
          </SpinBtn>
          <Link className="btn btn-primary btn-lg flex-fill" replace to={`/overview/${raiseId}`}>
            查看募集计划
          </Link>
        </div>
      </div>

      <Modal.Alert id="more-modal" title="接下来做什么？" confirmText="我知道了">
        <ul className="list-group list-group-flush text-main" role="group">
          <li className="list-group-item d-flex gap-3 border-0 mb-3">
            <div className="flex-shrink-0">
              <IconEdit />
            </div>
            <div className="flex-grow-1">
              <p className="mb-0">
                <span className="fw-bold">发起人</span>
                <span>签名</span>
              </p>
              <p className="mb-0 text-gray-dark">与您的合作伙伴讨论充分募集计划，签名将完成链上部署，上链之后不可修改。</p>
            </div>
          </li>
          <li className="list-group-item d-flex gap-3 border-0 mb-3">
            <div className="flex-shrink-0">
              <IconSafe />
            </div>
            <div className="flex-grow-1">
              <p className="mb-0">
                <span className="fw-bold">发起人</span>
                <span>存入”发起人保证金“</span>
              </p>
              <p className="mb-0 text-gray-dark">封装结束后，发起人可取回保证金，保证金原路退回存入时使用的钱包。</p>
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
              <p className="mb-0 text-gray-dark">募集计划需要得到技术服务商签名确认，同时将存储节点的Owner交给智能合约。</p>
            </div>
          </li>
          <li className="list-group-item d-flex gap-3 border-0 mb-3">
            <div className="flex-shrink-0">
              <IconSafe />
            </div>
            <div className="flex-grow-1">
              <p className="mb-0">
                <span className="fw-bold">技术服务商</span>
                <span>存入”技术运维保证金“</span>
              </p>
              <p className="mb-0 text-gray-dark">扇区全部到期后，技术服务商可取回保证金，保证金原路退回存入时使用的钱包。</p>
            </div>
          </li>
          <li className="list-group-item d-flex gap-3 border-0">
            <div className="flex-shrink-0">
              <IconLaunch />
            </div>
            <div className="flex-grow-1">
              <p className="mb-0">
                <span className="fw-bold">发起人</span>
                <span>启动</span>
              </p>
              <p className="mb-0 text-gray-dark">满足所有条件后，启动按钮生效，发起人决定启动时间，启动后募集期开始计时。</p>
            </div>
          </li>
        </ul>
      </Modal.Alert>
    </>
  );
}
