import { PackDataParams, PackDataResponse } from '@exodus/taquito-rpc';

export interface Packer {
    packData(data: PackDataParams): Promise<PackDataResponse>
}