import blake from '@exodus/blakejs';
import * as nacl from "tweetnacl";
import {
  b58cencode,
  b58cdecode,
  prefix,
  buf2hex,
  isValidPrefix,
  InvalidKeyError,
} from '@exodus/taquito-utils';
import toBuffer from 'typedarray-to-buffer';

/**
 * @description Provide signing logic for ed25519 curve based key (tz1)
 */
export class Tz1 {
  private _key: Uint8Array;
  private _publicKey: Uint8Array;

  /**
   *
   * @param key Encoded private key
   * @param encrypted Is the private key encrypted
   * @param decrypt Decrypt function
   */
  constructor(private key: string, encrypted: boolean, decrypt: (k: any) => any) {
    const keyPrefix = key.substr(0, encrypted ? 5 : 4);
    if (!isValidPrefix(keyPrefix)) {
      throw new InvalidKeyError(key, 'Key contains invalid prefix');
    }

    this._key = decrypt(b58cdecode(this.key, prefix[keyPrefix]));
    this._publicKey = this._key.slice(32);

    if (!this._key) {
      throw new InvalidKeyError(key, 'Unable to decode');
    }

    if (this._key.length !== 64) {
      const { publicKey, secretKey } = nacl.sign.keyPair.fromSeed(this._key)
      this._publicKey = publicKey;
      this._key = secretKey;
    }
  }

  /**
   *
   * @param bytes Bytes to sign
   * @param bytesHash Blake2b hash of the bytes to sign
   */
  sign(bytes: string, bytesHash: Uint8Array) {
    const signature = nacl.sign.detached(new Uint8Array(bytesHash), new Uint8Array(this._key));
    const signatureBuffer = toBuffer(signature);
    const sbytes = bytes + buf2hex(signatureBuffer);

    return {
      bytes,
      sig: b58cencode(signature, prefix.sig),
      prefixSig: b58cencode(signature, prefix.edsig),
      sbytes,
    };
  }

  /**
   * @returns Encoded public key
   */
  publicKey(): string {
    return b58cencode(this._publicKey, prefix['edpk']);
  }

  /**
   * @returns Encoded public key hash
   */
  publicKeyHash(): string {
    return b58cencode(blake.blake2b(new Uint8Array(this._publicKey), undefined, 20), prefix.tz1);
  }

  /**
   * @returns Encoded private key
   */
  secretKey(): string {
    let key = this._key;
    const { secretKey } = nacl.sign.keyPair.fromSeed(new Uint8Array(key).slice(0, 32))
    key = toBuffer(secretKey);

    return b58cencode(key, prefix[`edsk`]);
  }
}
