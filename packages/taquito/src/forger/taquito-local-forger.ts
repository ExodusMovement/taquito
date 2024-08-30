import {
  LocalForger,
  AsyncForger,
  ForgeParams,
  ForgeResponse,
  ProtocolsHash,
} from '@exodus/taquito-local-forging';
import { Protocols } from '../constants.js';
import { Context } from '../context.js';

export class TaquitoLocalForger implements AsyncForger {
  constructor(private context: Context) {}

  private async getNextProto(): Promise<ProtocolsHash> {
    if (!this.context.proto) {
      const nextProto = await this.context.readProvider.getNextProtocol('head');
      this.context.proto = nextProto as Protocols;
    }
    return this.context.proto as unknown as ProtocolsHash;
  }

  async forge({ branch, contents }: ForgeParams): Promise<ForgeResponse> {
    const forger = new LocalForger(await this.getNextProto());
    return forger.forge({ branch, contents });
  }
}
