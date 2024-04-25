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
  { img: require('./imgs/partners/MetaPath.png'), title: 'MetaPath', url: 'https://dapp.path.finance/?source=filfim' },
  {
    img: require('./imgs/partners/SWFT-Bridge.png'),
    title: 'SWFT Bridge',
    url: 'https://defi.swft.pro?sourceFlag=filfis',
  },
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

  useTitle('首頁 - FilFi', { restoreOnUnmount: true });

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
                  <span className="badge badge-primary bg-white lh-sm">FilFi聯合節點</span>
                  <span className="ms-2">創新的“節點計畫”讓建設者和SP重建信任</span>
                </span>
              </p>
              <h1 className={classNames('mb-4 fw-600', styles.title)}>
                Filecoin首個100%<span className="text-danger">智能合約</span>管理的儲存節點
                <span className="text-danger">聯合建設</span>方案
              </h1>
              <p className={classNames('mb-4 mb-lg-5', styles.summary)}>履約交給智能合約，安心領取節點激勵</p>
              <div className="d-flex flex-column flex-sm-row px-3 px-lg-0 gap-3 mb-3">
                <Link className="btn btn-primary btn-lg" to="/raising">
                  選擇節點計劃
                </Link>
                <button className="btn btn-light btn-lg" type="button" onClick={handleCreate}>
                  <span className="bi bi-plus-lg"></span>
                  <span className="ms-2">發起節點計劃</span>
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
            <h3 className={classNames('mb-3 fw-600', styles.title)}>為建設者而生</h3>
            <p className={classNames('text-gray-dark', styles.summary)}>
              守望建設者，重構儲存節點聯合建設規則，安全是一切節點激勵之源
            </p>
          </div>

          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
            <div className="col">
              <div className="card h-100">
                <div className="card-body">
                  <IconThumbs className="card-icon" />
                  <h4 className="card-title">智能合約接管一切</h4>
                  <p>質押、封裝進度、分配激勵，智能合約接手一切，堅定履約，不可變更，沒有人為因素。</p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card h-100">
                <div className="card-body">
                  <IconSearch className="card-icon" />
                  <h4 className="card-title">全流程極致透明</h4>
                  <p>質押100%進入智能合約，看得見每個FIL的建設明細，查得到每筆激勵的分配記錄，杜絕一切黑箱操作。</p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card h-100">
                <div className="card-body">
                  <IconClock className="card-icon" />
                  <h4 className="card-title">尊重時間價值</h4>
                  <p>如果質押不成功，質押全額退還，並補償滯留時間的價值。</p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card h-100">
                <div className="card-body">
                  <IconSmile className="card-icon" />
                  <h4 className="card-title">對建造者完全免費</h4>
                  <p>建設者100%取得節點計畫約定的分配比例，FilFi不會向建造者收取費用，也不會分享建造者的激勵。</p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card h-100">
                <div className="card-body">
                  <IconDots className="card-icon" />
                  <h4 className="card-title">去中心化治理</h4>
                  <p>FilFi由DAO社群治理，去中心化的方式共建共享，透過投票機制決定經濟模型的關鍵參數。</p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card h-100">
                <div className="card-body">
                  <IconShield className="card-icon" />
                  <h4 className="card-title">嚴格KYC和保證金制度</h4>
                  <p>
                    可選技術服務商經過社區嚴格的KYC，創新的“運維保證金”制度，確保技術服務商與建設者的短期利益和長期利益綁定。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={classNames(styles.section, styles.sectionTint)}>
        <div className="container">
          <div className="mb-5 text-center">
            <p className={classNames('text-gray-dark', styles.summary)}>合作夥伴及媒體支持</p>
          </div>
          <div className="mx-n3 text-center">
            <ul className="list-inline">
              {partners.map((item, i) => (
                <li key={i} className="list-inline-item m-3 m-xl-4">
                  <a className="text-reset" title={item.title} href={item.url} target="_blank" rel="noreferrer">
                    <img src={item.img} height="48" alt={item.title} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
