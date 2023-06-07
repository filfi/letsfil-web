import { TransactionReceipt } from 'viem';

export class RevertedError extends Error {
  readonly name = 'RevertedError';

  constructor(message: string, public receipt: TransactionReceipt) {
    super(message);
  }
}
