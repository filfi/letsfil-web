import { FormattedMessage, Link } from '@umijs/max';

import styles from './styles.less';
import { ReactComponent as Logo } from '@/assets/brand.svg';

const socials = [
  {
    title: 'Discord',
    url: 'https://discord.gg/tht348jhuy',
  },
  {
    title: 'Twitter',
    url: 'https://twitter.com/filfi_io',
  },
  {
    title: 'Telegram',
    // url: 'https://t.me/+eDw3nnwV7xQwZGM9',
    url: 'https://t.me/filfi_io',
  },
];

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className="row">
          <div className="col-12 col-lg-4 mb-5">
            <p className="mb-5">
              <Logo />
            </p>
            <p>Keep FIL flowing, never sleeping</p>
          </div>
          <div className="col-12 col-lg-8">
            <div className="row row-cols-2 row-cols-lg-3 g-3 g-xxl-4">
              <div className="col">
                <dl className="fw-semibold">
                  <dt className="mb-3">FIL Holder</dt>
                  <dd>
                    <p>
                      <a href="#">
                        <FormattedMessage id="menu.lending" />
                      </a>
                    </p>
                    <p>
                      <Link to="/">
                        <FormattedMessage id="menu.miner" />
                      </Link>
                    </p>
                  </dd>
                </dl>
              </div>
              <div className="col">
                <dl className="fw-semibold">
                  <dt className="mb-3">
                    <FormattedMessage id="menu.storage" />
                  </dt>
                  <dd className="d-flex flex-column">
                    <p>
                      <a href="#">Borrow FIL</a>
                    </p>
                    <p>
                      <a href="#">Raise FIL</a>
                    </p>
                    <p>
                      <a href="#">SP Foundry</a>
                    </p>
                  </dd>
                </dl>
              </div>
              <div className="col">
                <dl className="fw-semibold">
                  <dt className="mb-3">
                    <FormattedMessage id="menu.dao" />
                  </dt>
                  <dd className="d-flex flex-column">
                    {socials.map((item, key) => (
                      <p key={key}>
                        <a href={item.url} title={item.title}>
                          {item.title}
                        </a>
                      </p>
                    ))}
                  </dd>
                </dl>
              </div>
              {/* <div className="col">
                <dl className="fw-semibold">
                  <dt className="mb-3">Document</dt>
                  <dd className="d-flex flex-column">
                    <p>
                      <a href="https://docs.filfi.io/en/introduction/" target="_blank" rel="noreferrer">
                        Tutorial
                      </a>
                    </p>
                  </dd>
                </dl>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
