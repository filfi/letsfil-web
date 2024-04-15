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
            <h2 className="mb-4 text-center">FilFi 举办特殊情况智能合约体验日公告</h2>

            <p>FilFi致力于实现100%智能合约管理，所有节点参与方严格履约智能合约，依据合约领取各自权益。</p>
            <p>近期行业出现Fevm智能合约信任危机，FilFi团队以为技术进步不容倒退，坚信去中心化建设是我们坚守的Web3信念。</p>
            <p>
              FilFi定于4月15日12时—16日12时，举办24小时特殊情况（模仿运营管理团队全体终止工作）的智能合约体验日活动，届时FilFi官网将暂停服务，16日12时恢复正常。
            </p>
            <p>我们邀请所有用户参与该特殊情况体验日活动，体验期间请按照《FilFi特殊情况智能合约操作指南》执行各项业务需求。</p>
            <p>实现100%去中心化智能合约管理，必要条件是合约开源+社区代币投票权治理，FilFi正在遵照路线图紧张建设。</p>
            <p className="text-end">FilFi Dao社区</p>
          </div>

          <p className="mb-4 d-flex flex-column flex-md-row justify-content-md-center gap-4">
            <a className="btn btn-primary btn-lg" href="https://public-1a8hf.filfi.io/manual-operation-cn/filfi-manual-operation.mp4" data-fancybox>
              <span className="bi bi-play-circle"></span>
              <span className="ms-2">观看教学视频</span>
            </a>
            <a
              className="btn btn-light btn-lg"
              href="https://public-1a8hf.filfi.io/manual-operation-cn/FilFi%20%E7%89%B9%E6%AE%8A%E6%83%85%E5%86%B5%E6%99%BA%E8%83%BD%E5%90%88%E7%BA%A6%E6%93%8D%E4%BD%9C%E6%8C%87%E5%8D%97%202.0.pdf"
              data-fancybox
              data-type="pdf"
            >
              <span className="bi bi-file-earmark-text"></span>
              <span className="ms-2">查看教学文档</span>
            </a>
          </p>

          <p className="text-center">
            <a className="text-reset text-underline" href="#node-info" data-bs-toggle="modal">
              查询节点信息
            </a>
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
