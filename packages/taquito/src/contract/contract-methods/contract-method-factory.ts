import { Wallet } from '../../wallet/index.js';
import { ContractProvider } from '../../contract/index.js';
import { ContractMethodObject } from './contract-method-object-param.js';
import { ContractMethod } from './contract-method-flat-param.js';
import { ParameterSchema, ViewSchema } from '@exodus/taquito-michelson-encoder';
import { RpcClientInterface, MichelsonV1Expression } from '@exodus/taquito-rpc';
import { OnChainView } from './contract-on-chain-view.js';
import { TzReadProvider } from '../../read-provider/interface.js';

export class ContractMethodFactory<T extends ContractProvider | Wallet> {
  constructor(private provider: T, private contractAddress: string) {}

  createContractMethodFlatParams(
    smartContractMethodSchema: ParameterSchema,
    smartContractMethodName: string,
    args: any[],
    isMultipleEntrypoint = true,
    isAnonymous = false
  ) {
    return new ContractMethod<T>(
      this.provider,
      this.contractAddress,
      smartContractMethodSchema,
      smartContractMethodName,
      args,
      isMultipleEntrypoint,
      isAnonymous
    );
  }

  createContractMethodObjectParam(
    smartContractMethodSchema: ParameterSchema,
    smartContractMethodName: string,
    args: any[],
    isMultipleEntrypoint = true,
    isAnonymous = false
  ) {
    return new ContractMethodObject<T>(
      this.provider,
      this.contractAddress,
      smartContractMethodSchema,
      smartContractMethodName,
      args,
      isMultipleEntrypoint,
      isAnonymous
    );
  }

  createContractViewObjectParam(
    rpc: RpcClientInterface,
    readProvider: TzReadProvider,
    smartContractViewSchema: ViewSchema,
    contractStorageType: MichelsonV1Expression,
    viewArgs: any
  ) {
    return new OnChainView(
      rpc,
      readProvider,
      this.contractAddress,
      smartContractViewSchema,
      contractStorageType,
      viewArgs
    );
  }
}
