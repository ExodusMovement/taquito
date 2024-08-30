import { BlockResponse, OperationContentsAndResult, OperationResultStatusEnum } from '@exodus/taquito-rpc';
import { combineLatest, from, Observable, of, range, ReplaySubject } from '@exodus/rxjs';
import {
  catchError,
  concatMap,
  distinctUntilChanged,
  endWith,
  filter,
  first,
  map,
  publishReplay,
  refCount,
  switchMap,
  takeWhile,
  tap,
} from '@exodus/rxjs/operators/index.js';
import { Context } from '../context.js';
import { Receipt, receiptFromOperation } from './receipt.js';
import { validateOperation, ValidationResult, InvalidOperationHashError } from '@exodus/taquito-utils';
import { BlockIdentifier } from '../read-provider/interface.js';
import { InvalidConfirmationCountError, ConfirmationUndefinedError } from '../error.js';

export type OperationStatus = 'pending' | 'unknown' | OperationResultStatusEnum;

const MAX_BRANCH_ANCESTORS = 60;

/**
 * @description WalletOperation allows to monitor operation inclusion on chains and surface information related to the operation
 */
export class WalletOperation {
  protected _operationResult = new ReplaySubject<OperationContentsAndResult[]>(1);
  protected _includedInBlock = new ReplaySubject<BlockResponse>(1);
  protected _included = false;

  private lastHead: BlockResponse | undefined;
  protected newHead$: Observable<BlockResponse> = this._newHead$.pipe(
    switchMap((newHead) => {
      const prevHead = this.lastHead?.header.level ?? newHead.header.level - 1;
      return range(prevHead + 1, newHead.header.level - prevHead - 1).pipe(
        concatMap((level) => this.context.readProvider.getBlock(level)),
        endWith(newHead)
      );
    }),
    tap((newHead) => (this.lastHead = newHead)),
    publishReplay(1),
    refCount()
  );

  // Observable that emit once operation is seen in a block
  private confirmed$ = this.newHead$.pipe(
    map((head) => {
      for (const opGroup of head.operations) {
        for (const op of opGroup) {
          if (op.hash === this.opHash) {
            this._included = true;
            this._includedInBlock.next(head);
            this._operationResult.next(op.contents as OperationContentsAndResult[]);

            // Return the block where the operation was found
            return head;
          }
        }
      }
    }),
    filter<BlockResponse | undefined, BlockResponse>((x): x is BlockResponse => {
      return typeof x !== 'undefined';
    }),
    first(),
    publishReplay(1),
    refCount()
  );

  async operationResults() {
    return this._operationResult.pipe(first()).toPromise();
  }

  /**
   * @description Receipt expose the total amount of tezos token burn and spent on fees
   * The promise returned by receipt will resolve only once the transaction is included
   */
  async receipt(): Promise<Receipt> {
    return receiptFromOperation(await this.operationResults());
  }

  /**
   *
   * @param opHash Operation hash
   * @param raw Raw operation that was injected
   * @param context Taquito context allowing access to rpc and signer
   */
  constructor(
    public readonly opHash: string,
    protected readonly context: Context,
    private _newHead$: Observable<BlockResponse>
  ) {
    if (validateOperation(this.opHash) !== ValidationResult.VALID) {
      throw new InvalidOperationHashError(this.opHash);
    }
    this.confirmed$
      .pipe(
        first(),
        catchError(() => of(undefined))
      )
      .subscribe();
  }

  async getCurrentConfirmation() {
    if (!this._included) {
      return 0;
    }

    return combineLatest([this._includedInBlock, from(this.context.readProvider.getBlock('head'))])
      .pipe(
        map(([foundAtBlock, head]) => {
          return head.header.level - foundAtBlock.header.level + 1;
        }),
        first()
      )
      .toPromise();
  }

  async isInCurrentBranch(tipBlockIdentifier: BlockIdentifier = 'head') {
    // By default it is assumed that the operation is in the current branch
    if (!this._included) {
      return true;
    }

    const tipBlockHeaderLevel = await this.context.readProvider.getBlockLevel(tipBlockIdentifier);
    const inclusionBlock = await this._includedInBlock.pipe(first()).toPromise();

    const levelDiff = tipBlockHeaderLevel - inclusionBlock.header.level;

    // Block produced before the operation is included are assumed to be part of the current branch
    if (levelDiff <= 0) {
      return true;
    }

    const tipBlockLevel = Math.min(
      inclusionBlock.header.level + levelDiff,
      inclusionBlock.header.level + MAX_BRANCH_ANCESTORS
    );

    const blocks = new Set(await this.context.readProvider.getLiveBlocks(tipBlockLevel));
    return blocks.has(inclusionBlock.hash);
  }

  confirmationObservable(confirmations?: number) {
    if (typeof confirmations !== 'undefined' && confirmations < 1) {
      throw new InvalidConfirmationCountError('Confirmation count must be at least 1');
    }

    const { defaultConfirmationCount } = this.context.config;

    const conf = confirmations !== undefined ? confirmations : defaultConfirmationCount;

    if (conf === undefined) {
      throw new ConfirmationUndefinedError('Default confirmation count can not be undefined!');
    }

    return combineLatest([this._includedInBlock, this.newHead$]).pipe(
      distinctUntilChanged(([, previousHead], [, newHead]) => {
        return previousHead.hash === newHead.hash;
      }),
      map(([foundAtBlock, head]) => {
        return {
          block: head,
          expectedConfirmation: conf,
          currentConfirmation: head.header.level - foundAtBlock.header.level + 1,
          completed: head.header.level - foundAtBlock.header.level >= conf - 1,
          isInCurrentBranch: () => this.isInCurrentBranch(head.hash as BlockIdentifier),
        };
      }),
      takeWhile(({ completed }) => !completed, true)
    );
  }

  /**
   *
   * @param confirmations [0] Number of confirmation to wait for
   */
  confirmation(confirmations?: number) {
    return this.confirmationObservable(confirmations).toPromise();
  }
}
