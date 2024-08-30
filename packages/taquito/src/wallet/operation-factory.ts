import { BlockResponse } from '@exodus/taquito-rpc';
import {
  BehaviorSubject,
  concat,
  defer,
  from,
  Observable,
  of,
  range,
  SchedulerLike,
  throwError,
} from '@exodus/rxjs';
import {
  concatMap,
  mergeMap,
  publishReplay,
  refCount,
  startWith,
  switchMap,
  timeoutWith,
} from '@exodus/rxjs/operators';
import { Context } from '../context.js';
import { BlockIdentifier } from '../read-provider/interface.js';
import { createObservableFromSubscription } from '../subscribe/create-observable-from-subscription.js';
import { BatchWalletOperation } from './batch-operation.js';
import { DelegationWalletOperation } from './delegation-operation.js';
import { IncreasePaidStorageWalletOperation } from './increase-paid-storage-operation.js';
import { WalletOperation } from './operation.js';
import { OriginationWalletOperation } from './origination-operation.js';
import { TransactionWalletOperation } from './transaction-operation.js';

export function timeoutAfter<T>(timeoutMillisec: number): (source: Observable<T>) => Observable<T> {
  return function inner(source: Observable<T>): Observable<T> {
    return new BehaviorSubject(null).pipe(
      timeoutWith(timeoutMillisec, throwError(new Error('Confirmation polling timed out'))),
      mergeMap(() => source)
    );
  };
}

export const createNewPollingBasedHeadObservable = (
  sharedHeadOb: Observable<BlockResponse>,
  context: Context,
  _scheduler?: SchedulerLike
): Observable<BlockResponse> => {
  return sharedHeadOb.pipe(
    timeoutAfter(context.config.confirmationPollingTimeoutSecond * 1000),
    publishReplay(1),
    refCount()
  );
};

export interface OperationFactoryConfig {
  blockIdentifier?: string;
}

export class OperationFactory {
  constructor(private context: Context) {}

  // Cache the last block for one second across all operations
  private sharedHeadObs = defer(() => {
    return createObservableFromSubscription(this.context.stream.subscribeBlock('head'));
  });

  private async createNewHeadObservable() {
    return createNewPollingBasedHeadObservable(this.sharedHeadObs, this.context);
  }

  private createPastBlockWalker(startBlock: string, count = 1) {
    return from(this.context.readProvider.getBlock(startBlock as BlockIdentifier)).pipe(
      switchMap((block) => {
        if (count === 1) {
          return of(block);
        }

        return range(block.header.level, count - 1).pipe(
          startWith(block),
          concatMap(async (level) => {
            return this.context.readProvider.getBlock(
              typeof level === 'number' ? level : level.header.level
            );
          })
        );
      })
    );
  }

  private async createHeadObservableFromConfig({ blockIdentifier }: OperationFactoryConfig) {
    const observableSequence: Observable<BlockResponse>[] = [];

    if (blockIdentifier) {
      observableSequence.push(this.createPastBlockWalker(blockIdentifier));
    }

    observableSequence.push(await this.createNewHeadObservable());

    return concat(...observableSequence);
  }

  async createOperation(
    hash: string,
    config: OperationFactoryConfig = {}
  ): Promise<WalletOperation> {
    return new WalletOperation(
      hash,
      this.context.clone(),
      await this.createHeadObservableFromConfig(config)
    );
  }

  async createBatchOperation(
    hash: string,
    config: OperationFactoryConfig = {}
  ): Promise<BatchWalletOperation> {
    return new BatchWalletOperation(
      hash,
      this.context.clone(),
      await this.createHeadObservableFromConfig(config)
    );
  }

  async createTransactionOperation(
    hash: string,
    config: OperationFactoryConfig = {}
  ): Promise<TransactionWalletOperation> {
    return new TransactionWalletOperation(
      hash,
      this.context.clone(),
      await this.createHeadObservableFromConfig(config)
    );
  }

  async createDelegationOperation(
    hash: string,
    config: OperationFactoryConfig = {}
  ): Promise<DelegationWalletOperation> {
    return new DelegationWalletOperation(
      hash,
      this.context.clone(),
      await this.createHeadObservableFromConfig(config)
    );
  }

  async createOriginationOperation(
    hash: string,
    config: OperationFactoryConfig = {}
  ): Promise<OriginationWalletOperation> {
    return new OriginationWalletOperation(
      hash,
      this.context.clone(),
      await this.createHeadObservableFromConfig(config)
    );
  }

  async createIncreasePaidStorageOperation(
    hash: string,
    config: OperationFactoryConfig = {}
  ): Promise<IncreasePaidStorageWalletOperation> {
    return new IncreasePaidStorageWalletOperation(
      hash,
      this.context.clone(),
      await this.createHeadObservableFromConfig(config)
    )
  }
}
