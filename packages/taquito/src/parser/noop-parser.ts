import { OriginateParams } from '../operations/types.js';
import { ParserProvider } from './interface.js';

export class NoopParser implements ParserProvider {
    async prepareCodeOrigination(params: OriginateParams): Promise<OriginateParams> {
        return params;
    }
}