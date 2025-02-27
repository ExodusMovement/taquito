import { OperationContentsAndResult, OperationContentsAndResultTransaction } from '@exodus/taquito-rpc';
import BigNumber from 'bignumber.js';
import { Context } from '../context';
import { flattenErrors, flattenOperationResult, MergedOperationResult } from './operation-errors';
import { Operation } from './operations';
import {
  FeeConsumingOperation,
  ForgedBytes,
  GasConsumingOperation,
  RPCTransferOperation,
  StorageConsumingOperation,
} from './types';

/**
 * @description Transaction operation provides utility functions to fetch a newly issued transaction
 *
 * @warn Currently supports one transaction per operation
 */
export class TransactionOperation
  extends Operation
  implements GasConsumingOperation, StorageConsumingOperation, FeeConsumingOperation
{
  constructor(
    hash: string,
    private readonly params: RPCTransferOperation,
    public readonly source: string,
    raw: ForgedBytes,
    results: OperationContentsAndResult[],
    context: Context
  ) {
    super(hash, raw, results, context);
  }

  get operationResults() {
    const transactionOp =
      Array.isArray(this.results) &&
      (this.results.find(
        (op) => op.kind === 'transaction'
      ) as OperationContentsAndResultTransaction);
    return transactionOp ? [transactionOp] : [];
  }

  get status() {
    const operationResults = this.operationResults;
    const txResult = operationResults[0];
    if (txResult) {
      return txResult.metadata.operation_result.status;
    } else {
      return 'unknown';
    }
  }

  get amount() {
    return new BigNumber(this.params.amount);
  }

  get destination() {
    return this.params.destination;
  }

  get fee() {
    return this.params.fee;
  }

  get gasLimit() {
    return this.params.gas_limit;
  }

  get storageLimit() {
    return this.params.storage_limit;
  }

  private sumProp(arr: MergedOperationResult[], prop: keyof MergedOperationResult) {
    return arr.reduce((prev, current) => {
      return prop in current ? Number(current[prop]) + prev : prev;
    }, 0);
  }

  get consumedGas() {
    BigNumber.config({ DECIMAL_PLACES: 0, ROUNDING_MODE: BigNumber.ROUND_UP });
    return new BigNumber(this.consumedMilliGas).dividedBy(1000).toString();
  }

  get consumedMilliGas() {
    return String(
      this.sumProp(flattenOperationResult({ contents: this.operationResults }), 'consumed_milligas')
    );
  }

  get storageDiff() {
    return String(
      this.sumProp(
        flattenOperationResult({ contents: this.operationResults }),
        'paid_storage_size_diff'
      )
    );
  }

  get storageSize() {
    return String(
      this.sumProp(flattenOperationResult({ contents: this.operationResults }), 'storage_size')
    );
  }

  get errors() {
    return flattenErrors({ contents: this.operationResults });
  }
}
