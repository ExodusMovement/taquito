import { RpcClientInterface } from '@exodus/taquito-rpc';
import { ContractAbstraction, ContractProvider, Wallet, TzReadProvider } from '@exodus/taquito-taquito';
import { ViewImplementation, ViewImplementationType } from '../metadata-interface';
import { MichelsonStorageView } from './michelson-storage-view';

export class ViewFactory {
  getView(
    viewName: string,
    rpc: RpcClientInterface,
    readProvider: TzReadProvider,
    contract: ContractAbstraction<ContractProvider | Wallet>,
    viewImplementation: ViewImplementation
  ) {
    if (this.isMichelsonStorageView(viewImplementation)) {
      const viewValues = viewImplementation[ViewImplementationType.MICHELSON_STORAGE];
      if (!viewValues.returnType || !viewValues.code) {
        console.warn(
          `${viewName} is missing mandatory code or returnType property therefore it will be skipped.`
        );
        return;
      }
      return () => {
        const view = new MichelsonStorageView(
          viewName,
          contract,
          rpc,
          readProvider,
          viewValues.returnType as any,
          viewValues.code as any,
          viewValues.parameter as any
        );
        return view;
      };
    }
  }

  getImplementationType(viewImplementation: ViewImplementation) {
    return Object.keys(viewImplementation)[0];
  }

  private isMichelsonStorageView(
    viewImplementation: ViewImplementation
  ): viewImplementation is { [ViewImplementationType.MICHELSON_STORAGE]: any } {
    return (
      this.getImplementationType(viewImplementation) === ViewImplementationType.MICHELSON_STORAGE
    );
  }
}
