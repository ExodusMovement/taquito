import { Expr } from "@exodus/taquito-michel-codec";
import { UnconfiguredGlobalConstantsProviderError } from './error.js';
import { GlobalConstantHash, GlobalConstantsProvider } from './interface-global-constants-provider.js';

export class NoopGlobalConstantsProvider implements GlobalConstantsProvider {
    async getGlobalConstantByHash(_hash: GlobalConstantHash): Promise<Expr> {
        throw new UnconfiguredGlobalConstantsProviderError();
    }
}