/**
 * @packageDocumentation
 * @module @exodus/taquito-local-forging
 */

import { ForgeParams, Forger } from './interface.js';
import { CODEC } from './constants.js';
import { decoders } from './decoder.js';
import { encoders } from './encoder.js';
import { Uint8ArrayConsumer } from './uint8array-consumer.js';
import { validateBlock, ValidationResult, InvalidOperationKindError } from '@exodus/taquito-utils';
import { InvalidBlockHashError, InvalidOperationSchemaError } from './error.js';
import { validateMissingProperty, validateOperationKind } from './validator.js';
import { ProtocolsHash } from './protocols.js';

export { CODEC, opMapping, opMappingReverse } from './constants.js';
export * from './decoder.js';
export * from './encoder.js';
export * from './uint8array-consumer.js';
export * from './interface.js';
export { VERSION } from './version.js';
export { ProtocolsHash } from './protocols.js';

const PROTOCOL_CURRENT = ProtocolsHash.PtMumbai2;

export function getCodec(codec: CODEC, _proto: ProtocolsHash) {
  return {
    encoder: encoders[codec],
    decoder: (hex: string) => {
      const consumer = Uint8ArrayConsumer.fromHexString(hex);
      return decoders[codec](consumer) as any;
    },
  };
}

export class LocalForger implements Forger {
  constructor(public readonly protocolHash = PROTOCOL_CURRENT) {}

  private codec = getCodec(CODEC.MANAGER, this.protocolHash);

  forge(params: ForgeParams): string {
    if (validateBlock(params.branch) !== ValidationResult.VALID) {
      throw new InvalidBlockHashError(`The block hash ${params.branch} is invalid`);
    }

    for (const content of params.contents) {
      if (!validateOperationKind(content.kind)) {
        throw new InvalidOperationKindError(content.kind);
      }

      const diff = validateMissingProperty(content);
      if (diff.length === 1) {
        if (content.kind === 'delegation' && diff[0] === 'delegate') {
          continue;
        } else if (content.kind === 'origination' && diff[0] === 'delegate') {
          continue;
        } else if (content.kind === 'transaction' && diff[0] === 'parameters') {
          continue;
        } else if (content.kind === 'set_deposits_limit' && diff[0] === 'limit') {
          continue
        } else if (
          content.kind === ('tx_rollup_submit_batch' as unknown) &&
          diff[0] === 'burn_limit'
        ) {
          continue;
        } else {
          throw new InvalidOperationSchemaError(
            `Missing properties: ${diff.join(', ').toString()}`
          );
        }
      } else if (diff.length > 1) {
        throw new InvalidOperationSchemaError(`Missing properties: ${diff.join(', ').toString()}`);
      }
    }
    const forged = this.codec.encoder(params).toLowerCase();
    return forged;
  }

  parse(hex: string): ForgeParams {
    return this.codec.decoder(hex) as ForgeParams;
  }
}

export const localForger = new LocalForger();
