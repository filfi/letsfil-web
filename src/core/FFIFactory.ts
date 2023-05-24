import EventEmitter from 'eventemitter3';
import ethers, { BigNumber } from 'ethers';
import MetaMaskOboarding from '@metamask/onboarding';

import abi from '@/abis/factory.abi.json';
import { RAISE_ADDRESS } from '@/constants';

export type FactoryEvents = {
  onCreateRaisePlan(data: { id: BigNumber; raisePool: string; caller: string; raiseInfo: RaiseInfo; nodeInfo: NodeInfo; extraInfo: ExtraInfo }): void;
};

let instance: FFIFactory | undefined;

enum ContractEvents {
  onCreateRaisePlan = 'CreateRaisePlan',
}

function createContract() {
  if (MetaMaskOboarding.isMetaMaskInstalled()) {
    const provider = new ethers.providers.Web3Provider(window.ethereum!);

    const contract = new ethers.Contract(RAISE_ADDRESS, abi, provider.getSigner());
    console.log('[Factory Contract]: ', contract);
    return contract;
  }
}

function parseArgs<R extends object>(args: any[], keys: (keyof R)[]): R {
  return args.reduce(
    (d, val, idx) => ({
      ...d,
      [keys[idx]]: val,
    }),
    {},
  );
}

export default class FFIFactory extends EventEmitter<FactoryEvents> {
  static getInstance() {
    if (!instance) {
      instance = new FFIFactory();
    }

    return instance;
  }

  contract?: ethers.Contract;

  private constructor() {
    super();

    this.contract = createContract();

    this._initEvents();
  }

  private _createDispatch(event: keyof FactoryEvents) {
    return (...args: any[]) => {
      this.emit(event, parseArgs(args, ['id', 'raisePool', 'caller', 'raiseInfo', 'nodeInfo', 'extraInfo']));
    };
  }

  private _initEvents() {
    this.contract?.on(ContractEvents.onCreateRaisePlan, this._createDispatch('onCreateRaisePlan'));
  }

  async createRaisePlan(raise: RaiseInfo, node: NodeInfo, extra: ExtraInfo): Promise<string | undefined> {
    return await this.contract?.createRaisePlan(raise, node, extra);
  }
}
