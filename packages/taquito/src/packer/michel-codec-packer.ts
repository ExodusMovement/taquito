import { Packer } from './interface';
import { packDataBytes, MichelsonData, MichelsonType } from '@exodus/taquito-michel-codec'
import { PackDataResponse, PackDataParams } from '@exodus/taquito-rpc';

export class MichelCodecPacker implements Packer {

  async packData(data: PackDataParams): Promise<PackDataResponse> {
    const { bytes } = packDataBytes(data.data as MichelsonData, data.type as MichelsonType);
    return { packed: bytes }
  }
}
