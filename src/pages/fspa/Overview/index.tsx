import { useMemo } from 'react';
import { isAddress } from 'viem';
import classNames from 'classnames';
import renderHTML from 'react-render-html';
import { Image, Input, Result } from 'antd';
import { Link, useParams } from '@umijs/max';
import { useQuery } from '@tanstack/react-query';

import styles from './styles.less';
import { isEqual } from '@/utils/utils';
import Avatar from '@/components/Avatar';
import ShareBtn from '@/components/ShareBtn';
import LoadingView from '@/components/LoadingView';
import { getSPInfo, getSPNodes } from '@/apis/raise';
import { formatAddr, formatBytes, formatNum, formatPower, toNumber } from '@/utils/format';
import { ReactComponent as IconCopy } from '@/assets/icons/copy-06.svg';

export default function FSPAOverview() {
  const params = useParams();
  const address = useMemo(() => params.address, [params.address]);

  const info = useQuery(
    ['getSPInfo', address],
    async () => {
      if (address) {
        const res = await getSPInfo(address);
        return res.list;
      }
    },
    { staleTime: 60_000 },
  );

  const nodes = useQuery(
    ['getSPNodes', address],
    async () => {
      if (address) {
        const res = await getSPNodes(address);
        return res.list;
      }
    },
    { staleTime: 60_000 },
  );

  const provider = useMemo(() => info.data?.find((i) => isEqual(i.wallet_address, address)), [address, info.data]);
  const links = useMemo(() => {
    if (provider?.social_accounts) {
      try {
        const obj = JSON.parse(provider.social_accounts);
        return Object.keys(obj).map((name) => ({
          name,
          url: obj[name],
        }));
      } catch (e) {}
    }
  }, [provider?.social_accounts]);
  const showExtra = useMemo(
    () => provider?.idc_location || provider?.email || provider?.website || links,
    [provider, links],
  );

  const renderIntro = () => {
    const intro = `<div>${provider?.tech_introduction}</div>`;

    return renderHTML(intro);
  };

  if (!address || !isAddress(address)) {
    return (
      <>
        <Result
          status="404"
          title="未找到服務商"
          subTitle={
            <p className="text-center">
              <Link className="btn btn-primary px-4" replace to="/fspa">
                返回
              </Link>
            </p>
          }
        />
      </>
    );
  }

  return (
    <>
      <section className={styles.banner} />

      <section className={styles.main}>
        <div className="container">
          <LoadingView
            className="vh-50"
            data={provider}
            error={info.isError}
            loading={info.isLoading}
            retry={info.refetch}
          >
            <div className="d-flex flex-column align-items-center justify-content-center mb-5">
              <div className="mb-4 d-flex align-items-center justify-content-center">
                {provider ? (
                  provider.logo_url ? (
                    <Image
                      className="object-fit-contain"
                      height={160}
                      preview={false}
                      src={provider.logo_url}
                      placeholder={
                        <Image
                          className="object-fit-contain"
                          height={160}
                          preview={false}
                          src={require('@/assets/placeholder.png')}
                        />
                      }
                    />
                  ) : (
                    <Avatar address={provider.wallet_address} size={160} />
                  )
                ) : (
                  <Image
                    className="object-fit-contain"
                    height={160}
                    preview={false}
                    src={require('@/assets/placeholder.png')}
                  />
                )}
              </div>

              <h4 className="fw-600 mb-3">{provider?.full_name || formatAddr(provider?.wallet_address)}</h4>

              <p className="text-gray">FSPA聯盟成員</p>
            </div>

            <div className="row g-3 g-lg-4 g-xl-5 mb-5">
              <div
                className={classNames('col-12 col-lg-8', showExtra ? 'col-xl-9' : 'col-xl-10 offset-md-2 offset-xl-1')}
              >
                <p className="mb-3">{provider?.introduction}</p>

                <div className="d-flex flex-wrap gap-3 gap-xl-5 mb-5">
                  <div className="fs-sm">
                    <p className="mb-1 text-neutral">
                      <span className="fs-20 fw-600 text-main">{provider?.verify_node_count}</span>
                      <span className="ms-1">個</span>
                    </p>
                    <p className="mb-1 text-gray">社群驗證節點</p>
                  </div>
                  <div className="fs-sm">
                    <p className="mb-1 text-neutral">
                      <span className="fs-20 fw-600 text-main">{provider?.union_node_count}</span>
                      <span className="ms-1">個</span>
                    </p>
                    <p className="mb-1 text-gray">FilFi聯合節點</p>
                  </div>
                  <div className="fs-sm">
                    <p className="mb-1 text-neutral">
                      <span className="fs-20 fw-600 text-main">{formatPower(provider?.union_node_power)?.[0]}</span>
                      <span className="ms-1">{formatPower(provider?.union_node_power)?.[1]}</span>
                    </p>
                    <p className="mb-1 text-gray">聯合節點規模</p>
                  </div>
                  <div className="fs-sm">
                    <p className="mb-1 text-neutral">
                      <span className="fs-20 fw-600 text-main">
                        {formatNum(toNumber(provider?.union_node_reward), '0.0A')}
                      </span>
                      <span className="ms-1">FIL</span>
                    </p>
                    <p className="mb-1 text-gray">累計分配</p>
                  </div>
                  <div className="fs-sm">
                    <p className="mb-1 text-neutral">
                      <span className="fs-20 fw-600 text-main">{provider?.union_node_address_count}</span>
                      <span className="ms-1">地址</span>
                    </p>
                    <p className="mb-1 text-gray">共分配給</p>
                  </div>
                </div>

                <div className="mb-5">
                  <h4 className="fs-18 fw-600">簽名地址</h4>
                  <p className="text-gray">簽名位址是技術服務商在FilFi網路中提供服務的唯一識別。</p>
                  <div className="input-group">
                    <Input className="form-control" readOnly value={address} />

                    <ShareBtn className="btn btn-outline-light" text={`${address}`}>
                      <IconCopy />
                      <span className="ms-2">复制</span>
                    </ShareBtn>
                  </div>
                </div>

                <div className="mb-5">
                  <h4 className="fs-18 fw-600">運維節點</h4>
                  <p className="text-gray">SP運維的Filecoin節點，基於FilFi協定建置或通過了FilFi社群驗證。</p>

                  <LoadingView
                    className="my-5"
                    data={nodes.data}
                    error={nodes.isError}
                    loading={nodes.isLoading}
                    retry={nodes.refetch}
                  >
                    <div className="d-flex flex-wrap gap-3 mb-5">
                      {nodes.data?.map((item) => (
                        <div key={item.miner_id} className="card rounded-2 shadow-sm">
                          <div className="card-body py-3 px-4">
                            <div className="position-relative ps-3">
                              <span className="position-absolute top-0 start-0 mt-2 p-1 bg-success rounded-circle"></span>

                              <h4 className="mb-1 fs-18 fw-600">{item.miner_id}</h4>
                              <p className="mb-0 text-gray">
                                <span>{formatBytes(item.power)}</span>
                                {item.type === 1 && <span className="ms-1">@FilFi</span>}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </LoadingView>
                </div>

                <div className="mb-5">
                  <h4 className="mb-3 fs-18 fw-600">技術簡介</h4>
                  <div className="text-gray-dark">{renderIntro()}</div>
                </div>
              </div>
              {showExtra && (
                <div className="col-12 col-lg-4 col-xl-3">
                  {provider?.idc_location && (
                    <div className="mb-5">
                      <p className="mb-1">IDC位置</p>
                      <p className="mb-1">{provider?.idc_location}</p>
                    </div>
                  )}
                  {provider?.email && (
                    <div className="mb-5">
                      <p className="mb-1">信箱</p>
                      <p className="mb-1">
                        <a className="text-reset" href={`mailto:${provider?.email}`}>
                          <span className="me-2">{provider?.email}</span>
                          <span className="bi bi-arrow-up-right"></span>
                        </a>
                      </p>
                    </div>
                  )}
                  {provider?.website && (
                    <div className="mb-5">
                      <p className="mb-1">官網</p>
                      <p className="mb-1">
                        <a className="text-reset" href={provider?.website} target="_blank" rel="noreferrer">
                          <span className="me-2">{provider?.website}</span>
                          <span className="bi bi-arrow-up-right"></span>
                        </a>
                      </p>
                    </div>
                  )}
                  {links && (
                    <p className="hstack flex-wrap gap-3 text-gray fs-lg mb-5">
                      {links.map((item, idx) => (
                        <a
                          key={idx}
                          className="text-reset"
                          href={item.url}
                          title={item.name}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <span className={classNames('bi', `bi-${item.name}`)} />
                        </a>
                      ))}
                    </p>
                  )}
                </div>
              )}
            </div>
          </LoadingView>
        </div>
      </section>
    </>
  );
}
