import { useRef } from 'react';
import { ethers } from 'ethers';
import { useMount, useUnmount } from 'ahooks';
import MetaMaskOboarding from '@metamask/onboarding';

import toastify from '@/utils/toastify';
import useAccounts from './useAccounts';
import abi from '@/abis/factory.abi.json';
import { RAISE_ADDRESS } from '@/constants';
import { withGas, withTx } from '@/helpers/app';
import { createDispatcher, EventType } from '@/utils/mitt';

export type Options = {
  gas?: ethers.BigNumberish;
  gasLimit?: ethers.BigNumberish;
  gasPrice?: ethers.BigNumberish;
  maxFeePerGas?: ethers.BigNumber;
  maxPriorityFeePerGas?: ethers.BigNumberish;
  value?: ethers.BigNumberish;
};

export type RaiseInfo = {
  id: ethers.BigNumberish; // 募集ID，合约内递增唯一标识
  targetAmount: ethers.BigNumberish; // 募集目标
  securityFund: ethers.BigNumberish; // 保证金
  securityFundRate: ethers.BigNumberish; // 保证金比例 100以内的数字，10 -> 10%
  deadline: ethers.BigNumberish; // 募集截止时间，秒时间戳
  raiserShare: ethers.BigNumberish; // 募集者权益 100以内的数字，10 -> 10%
  investorShare: ethers.BigNumberish; // 投资者权益 100以内的数字，10 -> 10%
  servicerShare: ethers.BigNumberish; // 服务商权益 100以内的数字，10 -> 10%
  sponsor: string; // 发起账户
  raiseCompany: string; // 发起单位
  companyId: ethers.BigNumberish; // 服务商ID
  spAddress: string; // 服务商签名地址
};

export type NodeInfo = {
  minerID: ethers.BigNumberish; // Miner ID
  nodeSize: ethers.BigNumberish; // 节点大小   1073741824 = 1GiB = 1024MiB = 1024*1024KiB = 1024*1024*1024 byte
  sectorSize: ethers.BigNumberish; // 扇区大小   1073741824 = 1GiB = 1024MiB = 1024*1024KiB = 1024*1024*1024 byte
  sealPeriod: ethers.BigNumberish; // 封装周期    秒数
  nodePeriod: ethers.BigNumberish; // 运行周期   秒数
  realSealAmount: ethers.BigNumberish; // 真实封装数量
  opsSecurityFund: ethers.BigNumberish; // 运维保证金
  opsSecurityFundPayer: string; // 缴纳运维保证金地址
};

export type ExtraInfo = {
  minRaiseRate: ethers.BigNumberish; // 最小募集比例
};

function createContract() {
  if (MetaMaskOboarding.isMetaMaskInstalled()) {
    const provider = new ethers.providers.Web3Provider(window.ethereum!);

    const signer = provider.getSigner();

    return new ethers.Contract(RAISE_ADDRESS, abi, signer);
  }
}

function getMaxFeePerGas(from: number | string) {
  return ethers.BigNumber.from(from).add(200).toHexString();
}

const events = {
  // 募集计划创建
  onCreateRaise: createDispatcher(EventType.OnCreateRaisePlan, ['raisePool', 'caller', 'payValue', 'raiseInfo', 'nodeInfo', 'extraInfo', 'raiseID']),
};

export default function useRaiseContract() {
  const contract = useRef(createContract());

  const { withConnect } = useAccounts();

  const bindEvents = () => {
    console.log(contract.current);
    contract.current?.on('eCreateRaisePlan', events.onCreateRaise);
  };

  useMount(bindEvents);

  useUnmount(() => {
    contract.current?.off('eCreateRaisePlan', events.onCreateRaise);
  });

  const withContract = <R = any, P extends unknown[] = any>(handler: (contract: ethers.Contract | undefined, ...args: P) => Promise<R>) => {
    return async (...args: P) => {
      if (!contract.current) {
        contract.current = createContract();
        bindEvents();
      }

      return await handler(contract.current, ...args);
    };
  };

  const getRaisePool = toastify(
    withConnect(
      withContract(async (contract, sponsor: string, minerID: number, raiseID: number) => {
        return await contract?.getRaisePool(sponsor, minerID, raiseID);
      }),
    ),
  );

  // 创建募集计划
  const createRaisePlan = toastify(
    withConnect(
      withTx(
        withContract(
          withGas(async (maxPriorityFeePerGas, contract, raise: RaiseInfo, node: NodeInfo, extra: ExtraInfo, opts?: Options) => {
            console.log(raise, node, extra, opts);
            return await contract?.createRaisePlan(raise, node, extra, {
              maxPriorityFeePerGas,
              maxFeePerGas: getMaxFeePerGas(maxPriorityFeePerGas),
              // gasLimit: 1000000,
              ...opts,
            });
          }),
        ),
      ),
    ),
  );

  return { createRaisePlan, getRaisePool };
}
