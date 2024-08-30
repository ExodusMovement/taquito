import {
  BlockResponse,
  OperationContentsAndResultOrigination,
  OperationContentsAndResultReveal,
  OpKind,
} from '@exodus/taquito-rpc';
import { Observable } from '@exodus/rxjs';
import { Context } from '../context.js';
import { DefaultWalletType } from '../contract/contract.js';
import { findWithKind } from '../operations/types.js';
import { WalletOperation, OperationStatus } from './operation.js';

export class OriginationWalletOperation<TWallet extends DefaultWalletType = DefaultWalletType> extends WalletOperation {
  constructor(
    public readonly opHash: string,
    protected readonly context: Context,
    newHead$: Observable<BlockResponse>
  ) {
    super(opHash, context, newHead$);
  }

  public async originationOperation() {
    const operationResult = await this.operationResults();
    return findWithKind(operationResult, OpKind.ORIGINATION) as
      | OperationContentsAndResultOrigination
      | undefined;
  }

  public async revealOperation() {
    const operationResult = await this.operationResults();
    return findWithKind(operationResult, OpKind.REVEAL) as
      | OperationContentsAndResultReveal
      | undefined;
  }

  public async status(): Promise<OperationStatus> {
    if (!this._included) {
      return 'pending';
    }

    const op = await this.originationOperation();
    if (!op) {
      return 'unknown';
    }

    return op.metadata.operation_result.status;
  }

  public async contract() {
    const op = await this.originationOperation();
    const address = (op?.metadata.operation_result.originated_contracts || [])[0];
    return this.context.wallet.at<TWallet>(address);
  }
}
