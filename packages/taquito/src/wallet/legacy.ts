import { Context } from '../context.js';
import { attachKind, OpKind } from '../operations/types.js';
import {
  WalletDelegateParams,
  WalletIncreasePaidStorageParams,
  WalletOriginateParams,
  WalletProvider,
  WalletTransferParams,
} from './interface.js';
import { WalletParamsWithKind } from './wallet.js';

export class LegacyWalletProvider implements WalletProvider {
  constructor(private context: Context) {}

  async getPKH(): Promise<string> {
    return this.context.signer.publicKeyHash();
  }

  async mapTransferParamsToWalletParams(params: () => Promise<WalletTransferParams>) {
    return attachKind(await params(), OpKind.TRANSACTION);
  }

  async mapOriginateParamsToWalletParams(params: () => Promise<WalletOriginateParams>) {
    return attachKind(await params(), OpKind.ORIGINATION);
  }

  async mapDelegateParamsToWalletParams(params: () => Promise<WalletDelegateParams>) {
    return attachKind(await params(), OpKind.DELEGATION);
  }

  async mapIncreasePaidStorageWalletParams(params: () => Promise<WalletIncreasePaidStorageParams>) {
    return attachKind(await params(), OpKind.INCREASE_PAID_STORAGE);
  }

  async sendOperations(params: WalletParamsWithKind[]) {
    const op = await this.context.batch.batch(params as any).send();
    return op.hash;
  }
}
