import { Link } from '@umijs/max';

import Avatar from '@/components/Avatar';

export default function FSPAList() {
  return (
    <>
      <section className="py-5 bg-primary-tertiary text-primary-dark">
        <div className="container">
          <h3 className="mb-4 display-6 fw-600">加入 FSPA 联盟</h3>

          <p className="mb-4 fs-lg">
            加入 <strong>FSPA(FilFi Storage Provider Alliance)</strong>，链接FilFi网络，成为可信的Filecoin技术服务商。
          </p>
          <p className="mb-4 fs-lg">如果您是Filecoin Storage Provider，请点击</p>
          <p>
            <a className="btn btn-primary btn-lg" href="https://www.wjx.cn/vm/tSj3ajH.aspx" target="_blank" rel="noreferrer">
              加入 FSPA
            </a>
          </p>
        </div>
      </section>

      <section className="py-5">
        <div className="container my-3 text-center">
          <h4 className="mb-3 display-6 fw-600">Storage Provider</h4>
          <p className="mb-5">已通过FilFi DAO 社区KYC，正在FilFi网络提供服务</p>

          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3 g-md-4">
            <div className="col">
              <Link className="card h-100 rounded-4" to="/fspa/overview/1">
                <div className="card-body">
                  <p className="my-3">
                    <img className="img-fluid object-fit-contain" src="https://via.placeholder.com/583/243" style={{ height: 72 }} />
                  </p>
                  <h4 className="mb-1 fw-600 card-title">0xf012...m935</h4>
                  <p className="mb-3 text-gray">ONBOARDED</p>
                </div>
              </Link>
            </div>
            <div className="col">
              <Link className="card h-100 rounded-4" to="/fspa/overview/2">
                <div className="card-body">
                  <p className="my-3">
                    <Avatar size={72} />
                  </p>
                  <h4 className="mb-1 fw-600 card-title">0xf012...m935</h4>
                  <p className="mb-3 text-gray">ONBOARDED</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-primary-tertiary">
        <div className="container">
          <div className="d-flex flex-column flex-lg-row gap-3">
            <div className="flex-fill">
              <h3 className="mb-4 display-6 fw-600">我是 Storage Provider</h3>

              <p className="fs-lg">加入智能合约驱动的FilFi网络，成为可信的技术服务商</p>
            </div>
            <div>
              <a className="btn btn-primary btn-lg" href="https://www.wjx.cn/vm/tSj3ajH.aspx" target="_blank" rel="noreferrer">
                立刻加入 FSPA
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
