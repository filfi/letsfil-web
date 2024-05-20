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
            <h2 className="mb-4 text-center">FilFi社区停止中文服务公告</h2>
            <p>Mars Swap Ltd.对FilFi社区及基金会完成收购，Mars Swap Ltd.系开曼群岛注册公司，合法服务范围禁止提供中文服务。</p>
            <p>即日起，FilFi社区停止全部中文服务（官网和交流群），社区服务仅保留Discord和TG平台。</p>
            <p>Discord：<a href="https://discord.gg/7ARv9ZfM" target="_blank" rel="noreferrer">https://discord.gg/7ARv9ZfM</a></p>
            <p>TG：<a href="https://t.me/filfi_io" target="_blank" rel="noreferrer" >https://t.me/filfi_io</a></p>

            <p className="d-flex flex-wrap gap-3">
              <span className="my-auto">合约调用：</span>
              <a className="btn btn-primary" href="https://public-1a8hf.filfi.io/manual-operation-cn/filfi-manual-operation.mp4" data-fancybox>
                <span className="bi bi-play-circle"></span>
                <span className="ms-2">观看教学视频</span>
              </a>
              <a
                className="btn btn-light"
                href="https://public-1a8hf.filfi.io/manual-operation-cn%2FFilFi%20%E7%89%B9%E6%AE%8A%E6%83%85%E5%86%B5%E6%99%BA%E8%83%BD%E5%90%88%E7%BA%A6%E6%93%8D%E4%BD%9C%E6%8C%87%E5%8D%97%202.1.pdf"
                data-fancybox
                data-type="pdf"
              >
                <span className="bi bi-file-earmark-text"></span>
                <span className="ms-2">查看教学文档</span>
              </a>
              <a className="text-reset text-underline my-auto" href="#node-info" data-bs-toggle="modal">
                查询节点信息
              </a>
            </p>
            <p>快捷提取入口：<a href="https://cf-ipfs.com/ipfs/bafybeieac5ahoy2z3buevdymdwwed3pyk3qly4uxhiepwl453ommsyztpq" target="_blank" rel="noreferrer">https://cf-ipfs.com/ipfs/bafybeieac5ahoy2z3buevdymdwwed3pyk3qly4uxhiepwl453ommsyztpq</a></p>

            <p><br /></p>
            <p className="text-end">FilFi社区</p>
            <p className="text-end">2024年5月12日</p>
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
