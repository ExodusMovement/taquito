import { TransactionOperation } from '../../operations/transaction-operation.js';
import { TransferParams } from '../../operations/types.js';
import { ContractProvider } from '../interface.js';
import { TransactionWalletOperation, Wallet } from '../../wallet/index.js';
import { ParameterSchema } from '@exodus/taquito-michelson-encoder';
import {
  ContractMethodInterface,
  ExplicitTransferParams,
  SendParams,
} from './contract-method-interface.js';
import { DEFAULT_SMART_CONTRACT_METHOD_NAME } from '../contract.js';
import { InvalidParameterError } from '../errors.js';

/**
 * @description Utility class to send smart contract operation
 * The format for the arguments is the flattened representation
 */
export class ContractMethod<T extends ContractProvider | Wallet>
  implements ContractMethodInterface
{
  constructor(
    private provider: T,
    private address: string,
    private parameterSchema: ParameterSchema,
    private name: string,
    private args: any[],
    private isMultipleEntrypoint = true,
    private isAnonymous = false
  ) {}

  private validateArgs(args: any[], schema: ParameterSchema, name: string) {
    const sigs = schema.ExtractSignatures();

    if (!sigs.find((x: any[]) => x.length === args.length)) {
      throw new InvalidParameterError(name, sigs, args);
    }
  }

  /**
   * @description Get the schema of the smart contract method
   */
  get schema() {
    return this.isAnonymous
      ? this.parameterSchema.ExtractSchema()[this.name]
      : this.parameterSchema.ExtractSchema();
  }

  /**
   * @description Get the signature of the smart contract method
   */
  getSignature() {
    if (this.isAnonymous) {
      const sig = this.parameterSchema.ExtractSignatures().find((x: any[]) => x[0] === this.name);
      if (sig) {
        sig.shift();
        return sig;
      }
    } else {
      const sig = this.parameterSchema.ExtractSignatures();
      return sig.length == 1 ? sig[0] : sig;
    }
  }

  /**
   *
   * @description Send the smart contract operation
   *
   * @param Options generic operation parameter
   */
  send(
    params: Partial<SendParams> = {}
  ): Promise<T extends Wallet ? TransactionWalletOperation : TransactionOperation> {
    if (this.provider instanceof Wallet) {
      return (this.provider as unknown as Wallet)
        .transfer(this.toTransferParams(params))
        .send() as any;
    } else {
      return this.provider.transfer(this.toTransferParams(params)) as any;
    }
  }

  /**
   *
   * @description Create transfer params to be used with TezosToolkit.contract.transfer methods
   *
   * @param Options generic transfer operation parameters
   */
  toTransferParams({
    fee,
    gasLimit,
    storageLimit,
    source,
    amount = 0,
    mutez = false,
  }: Partial<SendParams> = {}): TransferParams {
    const fullTransferParams: ExplicitTransferParams = {
      to: this.address,
      amount,
      fee,
      mutez,
      source,
      gasLimit,
      storageLimit,
      parameter: {
        entrypoint: this.isMultipleEntrypoint ? this.name : DEFAULT_SMART_CONTRACT_METHOD_NAME,
        value: this.isAnonymous
          ? this.parameterSchema.Encode(this.name, ...this.args)
          : this.parameterSchema.Encode(...this.args),
      },
    };
    return fullTransferParams;
  }
}
