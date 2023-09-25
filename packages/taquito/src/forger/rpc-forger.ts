import { AsyncForger, ForgeParams, ForgeResponse } from '@exodus/taquito-local-forging';
import { Context } from '../context';

export class RpcForger implements AsyncForger {
  constructor(private context: Context) {}

  forge({ branch, contents }: ForgeParams): Promise<ForgeResponse> {
    return this.context.rpc.forgeOperations({ branch, contents });
  }
}
