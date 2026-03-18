import { Table } from 'antd';

import Modal from '@/components/Modal';
import list from './data/raise_info.json';
import Fancybox from '@/components/Fancybox';
import { ReactComponent as Logo } from './imgs/logo.svg';

export default function PageNotice() {
  return (
    <>
      <Fancybox className="flex flex-column flex-fill justify-content-center py-5 bg-primary-tertiary">
        <div className="container fs-20 text-primary-dark">
          <p className="mb-5 text-center">
            <Logo />
          </p>

          <div className="mb-5">
            <h2 className="mb-4 text-center">网站停止运营及提币通知</h2>
            <p><br /></p>
            <p><br /></p>
            <p>尊敬的用户：</p>
            <p>因所有节点已全部到期，本网站自公告发布之日起正式停止运营并关闭所有服务，感谢您一路以来的支持。</p>
            <p>为保障您的资产安全，我团队实施事后服务一年，截止日为2027年3月15日。请尚未完成提币的用户，请通过以下官方渠道提交信息办理：</p>

            <ul>
              <li>
                <p>提交材料：账户信息、钱包地址、节点号</p>
              </li>
              <li>
                <p>官方邮箱：<a href="mailto:filfi@filfi.io">filfi@filfi.io</a></p>
              </li>
              <li>
                <p>官方 TG：<a href="https://t.me/filfi_io" target="_blank" rel="noreferrer">@filfi_io</a></p>
              </li>
            </ul>
            <p>我们收到后将逐一核实处理。感谢您的理解与配合，由此带来的不便，我们深表歉意！</p>
            <p>特此公告。</p>

            <p><br /></p>
            <p><br /></p>
            <p className="text-end">FilFi社区</p>
            <p className="text-end">2026年3月16日</p>
          </div>

          <p className="mb-4 d-flex flex-column flex-md-row justify-content-md-center gap-4">
          </p>

          <p className="text-center">
          </p>
        </div>
      </Fancybox>

      <Modal id="node-info" size="lg" title="节点信息" showFooter={false}>
        <Table
          size="small"
          columns={[
            { title: '节点号', dataIndex: 'miner_id' },
            { title: '节点计划', dataIndex: 'raising_id' },
            { title: '合约地址', dataIndex: 'raise_address' },
          ]}
          dataSource={list}
          rowKey="miner_id"
        />
      </Modal>
    </>
  );
}
