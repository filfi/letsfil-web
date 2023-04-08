import { useRef } from 'react';
import { BigNumber, ethers } from 'ethers';
import { useMount, useUnmount } from 'ahooks';
import MetaMaskOboarding from '@metamask/onboarding';

import abi from '@/abis/factory.abi.json';
import { RAISE_ADDRESS } from '@/constants';
import useAuthHandler from './useAuthHandler';
import { createDispatcher, EventType } from '@/utils/mitt';

export type RaiseInfo = {
  id: number; // 募集ID，合约内递增唯一标识
  targetAmount: BigNumber; // 募集目标
  securityFund: BigNumber; // 保证金
  securityFundRate: number; // 保证金比例 100以内的数字，10 -> 10%
  deadline: number; // 募集截止时间，秒时间戳
  raiserShare: number; // 募集者权益 100以内的数字，10 -> 10%
  investorShare: number; // 投资者权益 100以内的数字，10 -> 10%
  servicerShare: number; // 服务商权益 100以内的数字，10 -> 10%
  sponsor: string; // 发起账户
  raiseCompany: string; // 发起单位
  spAddress: string; // 服务商签名地址
  companyId: number; // 服务商ID
};

export type NodeInfo = {
  minerID: number | string; // Miner ID
  nodeSize: number | string; // 节点大小   1073741824 = 1GiB = 1024MiB = 1024*1024KiB = 1024*1024*1024 byte
  sectorSize: number; // 扇区大小   1073741824 = 1GiB = 1024MiB = 1024*1024KiB = 1024*1024*1024 byte
  sealPeriod: number; // 封装周期    秒数
  nodePeriod: number; // 运行周期   秒数
  realSealAmount: number; // 真实封装数量
  opsSecurityFund: BigNumber; // 运维保证金
  opsSecurityFundPayer: string; // 缴纳运维保证金地址
};

function createContract() {
  if (MetaMaskOboarding.isMetaMaskInstalled()) {
    const provider = new ethers.providers.Web3Provider(window.ethereum!);

    const signer = provider.getSigner();

    return new ethers.Contract(RAISE_ADDRESS, abi.abi, signer);
  }
}

const events = {
  // 募集计划创建
  onCreateRaise: createDispatcher(EventType.OnCreateRaise, ['raisePool', 'caller', 'payValue', 'raiseInfo', 'nodeInfo', 'raiseID']),
};

export default function useRaiseContract() {
  const contract = useRef(createContract());

  const bindEvents = () => {
    console.log(contract.current);
    contract.current?.on('eCreateRaisePlan', events.onCreateRaise);
  };

  useMount(bindEvents);

  useUnmount(() => {
    contract.current?.off('eCreateRaisePlan', events.onCreateRaise);
  });

  const withContract = <R = any, P extends unknown[] = any>(handler: (...args: P) => Promise<R>) => {
    return async (...args: P) => {
      if (!contract.current) {
        contract.current = createContract();
        bindEvents();
      }

      return handler(...args);
    };
  };

  const getRaisePool = withContract(
    useAuthHandler(async (sponsor: string, minerID: number, raiseID: number) => {
      return await contract.current?.getRaisePool(sponsor, minerID, raiseID);
    }),
  );

  // 创建募集计划
  const createRaisePlan = withContract(
    useAuthHandler(async (raise: RaiseInfo, node: NodeInfo, opts?: { value?: BigNumber }) => {
      console.log(raise, node, opts);
      return await contract.current?.createRaisePlan(raise, node, opts);
    }),
  );

  return { createRaisePlan, getRaisePool };
}
