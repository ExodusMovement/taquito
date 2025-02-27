import { OperationContents } from '@exodus/taquito-rpc';

export interface ForgeParams {
  branch: string;
  contents: OperationContents[];
}

export type ForgeResponse = string; // hex string

export interface Forger {
  forge(params: ForgeParams): ForgeResponse;
}

export interface AsyncForger {
  forge(params: ForgeParams): Promise<ForgeResponse>;
}
