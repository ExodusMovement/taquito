import { Packer } from './interface.js';
import { Context } from '../context.js';
import { PackDataParams, PackDataResponse } from '@exodus/taquito-rpc';

export class RpcPacker implements Packer {
  constructor(private context: Context) {}
  
  async packData(data: PackDataParams): Promise<PackDataResponse> {
    return this.context.rpc.packData(data);
  }
}
