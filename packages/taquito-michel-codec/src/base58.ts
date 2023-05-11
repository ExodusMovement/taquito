import basex from 'base-x'
import bs58check from 'bs58check'

const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const bs58 = basex(BASE58)

/**
 *  @category Error
 *  @description Error that indicates a failure when decoding a base58 encoding
 */
export class Base58DecodingError extends Error {
  public name = 'Base58DecodingError';
  constructor(public message: string) {
    super(message);
  }
}

export function decodeBase58(src: string): number[] {
  let decoded: Uint8Array;
  try {
    decoded = bs58.decode(src)
  } catch(e) {
    throw new Base58DecodingError(`${e.name}: ${e.message}`)
  }
  return new Array(...decoded)
}

export function encodeBase58(src: number[] | Uint8Array): string {
  return bs58.encode(src)
}

export function decodeBase58Check(src: string): number[] {
  let decoded: Uint8Array;
  try {
    decoded = bs58check.decode(src)
  } catch(e) {
    throw new Base58DecodingError(`${e.name}: ${e.message}`)
  }
  return new Array(...decoded)
}

export function encodeBase58Check(src: number[] | Uint8Array): string {
  return bs58check.encode(Buffer.from(src))
}
