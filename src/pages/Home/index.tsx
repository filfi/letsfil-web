import { useTitle } from 'ahooks';
import classNames from 'classnames';
import { Link, history } from '@umijs/max';

import styles from './styles.less';
import useAuthHandler from '@/hooks/useAuthHandler';
import { ReactComponent as IconThumbs } from './imgs/icon-thumbs.svg';
import { ReactComponent as IconSearch } from './imgs/icon-search.svg';
import { ReactComponent as IconClock } from './imgs/icon-clock.svg';
import { ReactComponent as IconSmile } from './imgs/icon-smile.svg';
import { ReactComponent as IconDots } from './imgs/icon-dots.svg';
import { ReactComponent as IconShield } from './imgs/icon-shield.svg';

export default function Home() {
  useTitle('首页 - FilFi', { restoreOnUnmount: true });

  const handleCreate = useAuthHandler(async () => {
    history.push('/account');
  });

  return (
    <>
      <section className={classNames(styles.section, styles.banner)}>
        <div className="container">
          <div className="row row-cols-1 row-cols-lg-2 g-4 align-items-lg-center">
            <div className="col">
              <p className="mb-4">
                <span className="badge badge-primary ps-1">
                  <span className="badge badge-primary bg-white lh-sm">FilFi联合节点</span>
                  <span className="ms-2">创新的“募集计划”让投资者和SP重建信任</span>
                </span>
              </p>
              <h1 className={classNames('mb-4 fw-600', styles.title)}>
                Filecoin首个100%<span className="text-danger">智能合约</span>管理的存储节点<span className="text-danger">联合建设</span>方案
              </h1>
              <p className={classNames('mb-4 mb-lg-5', styles.summary)}>履约交给智能合约，安心领取收益</p>
              <div className="d-flex flex-column flex-sm-row px-3 px-lg-0 gap-3 mb-3">
                <Link className="btn btn-primary btn-lg" to="/raising">
                  选择募集计划
                </Link>
                <button className="btn btn-light btn-lg" type="button" onClick={handleCreate}>
                  <span className="bi bi-plus-lg"></span>
                  <span className="ms-2">发起募集计划</span>
                </button>
              </div>
            </div>
            <div className="col text-center">
              <img className="img-fluid" src={require('./imgs/snapshot.png')} />
            </div>
          </div>
        </div>
      </section>

      <section className={classNames(styles.section, styles.grid)}>
        <div className="container text-center">
          <div className="mb-5">
            <h3 className={classNames('mb-3 fw-600', styles.title)}>为投资者而生</h3>
            <p className={classNames('text-gray-dark', styles.summary)}>守望投资者，重构存储节点联合建设规则，安全是一切收益之源</p>
          </div>

          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
            <div className="col">
              <div className="card h-100">
                <div className="card-body">
                  <IconThumbs className="card-icon" />
                  <h4 className="card-title">智能合约接管一切</h4>
                  <p>募集质押币、封装进度、分配收益，智能合约接管一切，坚定履约，不可变更，没有任何人为因素。</p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card h-100">
                <div className="card-body">
                  <IconSearch className="card-icon" />
                  <h4 className="card-title">全流程极致透明</h4>
                  <p>投资100%流入智能合约，看得见每个FIL的投资去向，查得到每笔激励的分配记录，杜绝一切黑箱操作。</p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card h-100">
                <div className="card-body">
                  <IconClock className="card-icon" />
                  <h4 className="card-title">尊重时间价值</h4>
                  <p>投资第一秒就开始计息，消灭资金等待的空窗期，不论募集计划成功与否，没有一秒是闲置的。</p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card h-100">
                <div className="card-body">
                  <IconSmile className="card-icon" />
                  <h4 className="card-title">对投资者完全免费</h4>
                  <p>投资者100%获得募集计划承诺的分成比例，FilFi不会向投资者收取任何费用，也不会分享投资者的收益。</p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card h-100">
                <div className="card-body">
                  <IconDots className="card-icon" />
                  <h4 className="card-title">去中心化治理</h4>
                  <p>FilFi由DAO社区治理，去中心化的方式共建共享，通过投票机制决定经济模型的关键参数</p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card h-100">
                <div className="card-body">
                  <IconShield className="card-icon" />
                  <h4 className="card-title">严格KYC和保证金制度</h4>
                  <p>可选技术服务商经过社区严格的KYC，创新的“技术运维保证金”制度，确保技术服务商相关利益不低于10%，与投资者利益全周期绑定。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
