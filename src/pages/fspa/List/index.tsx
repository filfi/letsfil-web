import { Image } from 'antd';
import { Link } from '@umijs/max';

import Avatar from '@/components/Avatar';
import { formatAddr } from '@/utils/format';
import useSProviders from '@/hooks/useSProviders';
import LoadingView from '@/components/LoadingView';

export default function FSPAList() {
  const { data, isError, isLoading, refetch } = useSProviders();

  return (
    <>
      <section className="py-5 bg-primary-tertiary text-primary-dark">
        <div className="container">
          <h3 className="mb-4 display-6 fw-600">加入 FSPA 聯盟</h3>

          <p className="mb-4 fs-lg">
            加入 <strong>FSPA(FilFi Storage Provider Alliance)</strong>，連結FilFi網絡，成為可信賴的Filecoin技術服務商。
          </p>
          <p className="mb-4 fs-lg">如果您是Filecoin Storage Provider，請點擊</p>
          <p>
            <a
              className="btn btn-primary btn-lg"
              href="https://www.wjx.cn/vm/tSj3ajH.aspx"
              target="_blank"
              rel="noreferrer"
            >
              加入 FSPA
            </a>
          </p>
        </div>
      </section>

      <section className="py-5">
        <div className="container my-3 text-center">
          <h4 className="mb-3 display-6 fw-600">Storage Provider</h4>
          <p className="mb-5">已通過FilFi DAO 社區KYC，正在FilFi網路提供服務</p>

          <LoadingView className="my-5 py-5" data={data} error={isError} loading={isLoading} retry={refetch}>
            <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3 g-md-4">
              {data?.map((item) => (
                <div key={item.id} className="col">
                  <Link className="card h-100 rounded-4" to={`/fspa/overview/${item.wallet_address}`}>
                    <div className="card-body">
                      <div className="my-3">
                        {item.logo_url ? (
                          <Image
                            className="img-fluid object-fit-contain"
                            height={72}
                            preview={false}
                            src={item.logo_url}
                            placeholder={
                              <Image
                                className="object-fit-contain"
                                height={72}
                                preview={false}
                                src={require('@/assets/placeholder.png')}
                              />
                            }
                          />
                        ) : (
                          <Avatar address={item.wallet_address} size={72} />
                        )}
                      </div>
                      <h4 className="mb-1 fw-600 card-title">{item.full_name || formatAddr(item.wallet_address)}</h4>
                      <p className="mb-3 text-gray">ONBOARDED</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </LoadingView>
        </div>
      </section>

      <section className="py-5 bg-primary-tertiary">
        <div className="container">
          <div className="d-flex flex-column flex-lg-row gap-3">
            <div className="flex-fill">
              <h3 className="mb-4 display-6 fw-600">我是 Storage Provider</h3>

              <p className="fs-lg">加入智慧合約驅動的FilFi網絡，成為可信賴的技術服務商</p>
            </div>
            <div>
              <a
                className="btn btn-primary btn-lg"
                href="https://www.wjx.cn/vm/tSj3ajH.aspx"
                target="_blank"
                rel="noreferrer"
              >
                立刻加入 FSPA
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
