import { OriginateParams } from '../operations/types.js';

export interface ParserProvider {
    prepareCodeOrigination(params: OriginateParams): Promise<OriginateParams>;
}