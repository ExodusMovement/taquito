import { Schema } from '@exodus/taquito-michelson-encoder';
import { Context, ContractAbstraction, ContractProvider, Wallet } from '@exodus/taquito-taquito';
import { Handler, Tzip16Uri } from '../metadata-provider';
import { bytes2Char } from '@exodus/taquito-utils';
import {
  InvalidMetadataType,
  BigMapMetadataNotFound,
  InvalidUri,
  MetadataNotFound,
} from '../tzip16-errors';

const typeOfValueToFind = {
  prim: 'big_map',
  args: [{ prim: 'string' }, { prim: 'bytes' }],
  annots: ['%metadata'],
};

export type BigMapId = { int: string };

export class TezosStorageHandler implements Handler {
  private readonly TEZOS_STORAGE_REGEX = /^(?:\/\/(KT1\w{33})(?:\.(.+))?\/)?([\w|%]+)$/;

  async getMetadata(
    contractAbstraction: ContractAbstraction<ContractProvider | Wallet>,
    { location }: Tzip16Uri,
    context: Context
  ) {
    const parsedTezosStorageUri = this.parseTezosStorageUri(location);
    if (!parsedTezosStorageUri) {
      throw new InvalidUri(`tezos-storage:${location}`);
    }
    const script = await context.readProvider.getScript(
      parsedTezosStorageUri.contractAddress || contractAbstraction.address,
      'head'
    );
    const bigMapId = Schema.fromRPCResponse({ script }).FindFirstInTopLevelPair<BigMapId>(
      script.storage,
      typeOfValueToFind
    );

    if (!bigMapId || !bigMapId.int) {
      throw new BigMapMetadataNotFound();
    }
    const bytes = await context.contract.getBigMapKeyByID<string>(
      bigMapId.int.toString(),
      parsedTezosStorageUri.path,
      new Schema(typeOfValueToFind)
    );

    if (!bytes) {
      throw new MetadataNotFound(
        `No '${parsedTezosStorageUri.path}' key found in the big map %metadata of the contract ${
          parsedTezosStorageUri.contractAddress || contractAbstraction.address
        }`
      );
    }

    if (!/^[0-9a-fA-F]*$/.test(bytes)) {
      throw new InvalidMetadataType();
    }
    return bytes2Char(bytes);
  }

  /**
   * @description Extract the smart contract address, the network and the path pointing to the metadata from the uri
   * @returns an object which contains the properties allowing to find where the metadata are located or it returns undefined if the uri is not valid
   * @param tezosStorageURI URI (without the tezos-storage prefix)
   */
  private parseTezosStorageUri(tezosStorageURI: string) {
    const extractor = this.TEZOS_STORAGE_REGEX.exec(tezosStorageURI);
    if (!extractor) return;
    return {
      contractAddress: extractor[1],
      network: extractor[2],
      path: decodeURIComponent(extractor[3]),
    };
  }
}
