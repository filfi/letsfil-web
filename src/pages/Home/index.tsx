import { useTitle } from 'ahooks';
import classNames from 'classnames';
import { Link, history } from '@umijs/max';

import styles from './styles.less';
import useAccount from '@/hooks/useAccount';
import { ReactComponent as IconThumbs } from './imgs/icon-thumbs.svg';
import { ReactComponent as IconSearch } from './imgs/icon-search.svg';
import { ReactComponent as IconClock } from './imgs/icon-clock.svg';
import { ReactComponent as IconSmile } from './imgs/icon-smile.svg';
import { ReactComponent as IconDots } from './imgs/icon-dots.svg';
import { ReactComponent as IconShield } from './imgs/icon-shield.svg';

const partners = [
  { img: require('./imgs/partners/sxx.png'), title: 'SXX', url: 'https://sxxfuture.com/' },
  { img: require('./imgs/partners/filfox.png'), title: 'Filfox', url: 'https://filfox.info/zh' },
  { img: require('./imgs/partners/FNS-DAO.png'), title: 'FNS DAO', url: 'https://fns.space/' },
  { img: require('./imgs/partners/filemarket.png'), title: 'Filemarket', url: 'https://filemarket.xyz/' },
  { img: require('./imgs/partners/filscan.png'), title: 'Filscan', url: 'https://filscan.io/' },
  { img: require('./imgs/partners/DSPA.png'), title: 'DSPA', url: 'https://dspa-asia.io' },
  { img: require('./imgs/partners/Flamelaunch.png'), title: 'Flamelaunch', url: 'https://www.flamelaunch.com' },
  { img: require('./imgs/partners/opengate.png'), title: 'opengate', url: 'https://fil.opengatenft.com/#/' },
  { img: require('./imgs/partners/SPex.png'), title: 'SPex', url: 'https://www.spex.website' },
  { img: require('./imgs/partners/vedao.png'), title: 'veDAO', url: 'https://www.vedao.com' },
  { img: require('./imgs/partners/MetaPath.png'), title: 'MetaPath', url: 'https://dapp.path.finance/#/swap?source=path-dapp' },
  { img: require('./imgs/partners/SWFT-Bridge.png'), title: 'SWFT Bridge', url: 'https://defi.swft.pro/#/' },
  { img: require('./imgs/partners/Filedoge.png'), title: 'Filedoge', url: 'https://filedoge.io' },
  { img: require('./imgs/partners/FileDrive.png'), title: 'FileDrive', url: 'https://filedrive.io' },
  { img: require('./imgs/partners/Filutils.png'), title: 'Filutils', url: 'https://www.filutils.com/zh' },
  { img: require('./imgs/partners/seer.png'), title: 'seer', url: 'https://seer.eco/#/' },
  { img: require('./imgs/partners/Cointime.png'), title: 'Cointime', url: 'https://www.cointime.com/' },
  { img: require('./imgs/partners/Filecoin.png'), title: 'Filecoin', url: 'https://filecoin.io/zh-cn/' },
  { img: require('./imgs/partners/FVM.png'), title: 'FVM', url: 'https://fvm.filecoin.io' },
  { img: require('./imgs/partners/Protocal-Labs.png'), title: 'Protocal Labs', url: 'https://protocol.ai' },
  { img: require('./imgs/partners/Filecoin-Foundation.png'), title: 'Filecoin Foundation', url: 'https://fil.org' },
  { img: require('./imgs/partners/filecoingreen.png'), title: 'filecoingreen', url: 'https://green.filecoin.io/' },
];

export default function Home() {
  const { withConnect } = useAccount();

  useTitle('首页 - FilFi', { restoreOnUnmount: true });

  const handleCreate = withConnect(async () => {
    history.push('/account');
  });

  return (
    <>
      <section className={classNames(styles.section, styles.banner)}>
        <div className="container">
          <div className="row g-4 align-items-lg-center">
            <div className="col-12 col-lg-6">
              <p className="mb-4">
                <span className="badge badge-primary ps-1 text-wrap">
                  <span className="badge badge-primary bg-white lh-sm">FilFi联合节点</span>
                  <span className="ms-2">创新的“节点计划”让建设者和SP重建信任</span>
                </span>
              </p>
              <h1 className={classNames('mb-4 fw-600', styles.title)}>
                Filecoin首个100%<span className="text-danger">智能合约</span>管理的存储节点<span className="text-danger">联合建设</span>方案
              </h1>
              <p className={classNames('mb-4 mb-lg-5', styles.summary)}>履约交给智能合约，安心领取节点激励</p>
              <div className="d-flex flex-column flex-sm-row px-3 px-lg-0 gap-3 mb-3">
                <Link className="btn btn-primary btn-lg" to="/raising">
                  选择节点计划
                </Link>
                <button className="btn btn-light btn-lg" type="button" onClick={handleCreate}>
                  <span className="bi bi-plus-lg"></span>
                  <span className="ms-2">发起节点计划</span>
                </button>
              </div>
            </div>
            <div className="col-12 col-lg-6 text-center">
              <img className="img-fluid" src={require('./imgs/snapshot.png')} />
            </div>
          </div>
        </div>
      </section>

      <section className={classNames(styles.section, styles.grid)}>
        <div className="container text-center">
          <div className="mb-5">
            <h3 className={classNames('mb-3 fw-600', styles.title)}>为建设者而生</h3>
            <p className={classNames('text-gray-dark', styles.summary)}>守望建设者，重构存储节点联合建设规则，安全是一切节点激励之源</p>
          </div>

          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
            <div className="col">
              <div className="card h-100">
                <div className="card-body">
                  <IconThumbs className="card-icon" />
                  <h4 className="card-title">智能合约接管一切</h4>
                  <p>质押、封装进度、分配激励，智能合约接管一切，坚定履约，不可变更，没有人为因素。</p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card h-100">
                <div className="card-body">
                  <IconSearch className="card-icon" />
                  <h4 className="card-title">全流程极致透明</h4>
                  <p>质押100%进入智能合约，看得见每个FIL的建设明细，查得到每笔激励的分配记录，杜绝一切黑箱操作。</p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card h-100">
                <div className="card-body">
                  <IconClock className="card-icon" />
                  <h4 className="card-title">尊重时间价值</h4>
                  <p>如果质押不成功，质押全额返还，并补偿滞留时间的价值。</p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card h-100">
                <div className="card-body">
                  <IconSmile className="card-icon" />
                  <h4 className="card-title">对建设者完全免费</h4>
                  <p>建设者100%获得节点计划约定的分配比例，FilFi不会向建设者收取费用，也不会分享建设者的激励。</p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card h-100">
                <div className="card-body">
                  <IconDots className="card-icon" />
                  <h4 className="card-title">去中心化治理</h4>
                  <p>FilFi由DAO社区治理，去中心化的方式共建共享，通过投票机制决定经济模型的关键参数。</p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card h-100">
                <div className="card-body">
                  <IconShield className="card-icon" />
                  <h4 className="card-title">严格KYC和保证金制度</h4>
                  <p>可选技术服务商经过社区严格的KYC，创新的“运维保证金”制度，确保技术服务商与建设者的短期利益和长期利益绑定。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={classNames(styles.section, styles.sectionTint)}>
        <div className="container">
          <div className="mb-5 text-center">
            <p className={classNames('text-gray-dark', styles.summary)}>合作伙伴及媒体支持</p>
          </div>
          <ul className="list-inline text-center">
            {partners.map((item, i) => (
              <li key={i} className="list-inline-item m-3 m-lg-4">
                <a className="text-reset" title={item.title} href={item.url} target="_blank" rel="noreferrer">
                  <img src={item.img} height="48" alt={item.title} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
