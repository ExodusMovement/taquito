import {
  BlockResponse,
  OperationContentsAndResultOrigination,
  OperationContentsAndResultReveal,
  OpKind,
} from '@exodus/taquito-rpc';
import { Observable } from '@exodus/rxjs';
import { BATCH_KINDS } from '../batch/rpc-batch-provider.js';
import { Context } from '../context.js';
import { hasMetadataWithResult } from '../operations/types.js';
import { WalletOperation, OperationStatus } from './operation.js';

export class BatchWalletOperation extends WalletOperation {
  constructor(
    public readonly opHash: string,
    protected readonly context: Context,
    newHead$: Observable<BlockResponse>
  ) {
    super(opHash, context, newHead$);
  }

  public async revealOperation() {
    const operationResult = await this.operationResults();
    return operationResult.find((x) => x.kind === OpKind.REVEAL) as
      | OperationContentsAndResultReveal
      | undefined;
  }

  public getOriginatedContractAddresses = async (): Promise<string[]> => {
    const opResult = await this.operationResults();

    const originationOpResults = opResult.filter(
      (x) => x.kind === 'origination'
    ) as OperationContentsAndResultOrigination[];

    let addresses: string[] = [];
    for (const res of originationOpResults) {
      if (res.metadata.operation_result.originated_contracts) {
        addresses = [...addresses, ...res.metadata.operation_result.originated_contracts];
      }
    }

    return addresses;
  };

  async status(): Promise<OperationStatus> {
    if (!this._included) {
      return 'pending';
    }

    const op = await this.operationResults();

    return (
      op
        .filter((result) => BATCH_KINDS.indexOf(result.kind) !== -1)
        .map((result) => {
          if (hasMetadataWithResult(result)) {
            // @ts-ignore
            return result.metadata.operation_result.status;
          } else {
            return 'unknown';
          }
        })[0] || 'unknown'
    );
  }
}
