import blake from '@exodus/blakejs';
import { b58cencode, b58cdecode, prefix, isValidPrefix, InvalidKeyError } from '@exodus/taquito-utils';
import toBuffer from 'typedarray-to-buffer';
import elliptic from 'elliptic';

const pref = {
  p256: {
    pk: prefix['p2pk'],
    sk: prefix['p2sk'],
    pkh: prefix.tz3,
    sig: prefix.p2sig,
  },
  secp256k1: {
    pk: prefix['sppk'],
    sk: prefix['spsk'],
    pkh: prefix.tz2,
    sig: prefix.spsig,
  },
};

/**
 * @description Provide signing logic for elliptic curve based key (tz2, tz3)
 */
export class ECKey {
  private _key: Uint8Array;
  private _publicKey: Uint8Array;

  /**
   *
   * @param curve Curve to use with the key
   * @param key Encoded private key
   * @param encrypted Is the private key encrypted
   * @param decrypt Decrypt function
   */
  constructor(
    private curve: 'p256' | 'secp256k1',
    private key: string,
    encrypted: boolean,
    decrypt: (k: any) => any
  ) {
    const keyPrefix = key.substr(0, encrypted ? 5 : 4);
    if (!isValidPrefix(keyPrefix)) {
      throw new InvalidKeyError(key, 'Key contains invalid prefix');
    }

    this._key = decrypt(b58cdecode(this.key, prefix[keyPrefix]));
    const keyPair = new elliptic.ec(this.curve).keyFromPrivate(this._key);
    const keyPairY = keyPair.getPublic().getY().toArray();
    const parityByte = keyPairY.length < 32 ? keyPairY[keyPairY.length - 1] : keyPairY[31];
    const pref = parityByte % 2 ? 3 : 2;
    const pad = new Array(32).fill(0);
    this._publicKey = toBuffer(
      new Uint8Array([pref].concat(pad.concat(keyPair.getPublic().getX().toArray()).slice(-32)))
    );
  }

  /**
   *
   * @param bytes Bytes to sign
   * @param bytesHash Blake2b hash of the bytes to sign
   */
  sign(bytes: string, bytesHash: Uint8Array) {
    const key = new elliptic.ec(this.curve).keyFromPrivate(this._key);
    const sig = key.sign(bytesHash, { canonical: true });
    const signature = sig.r.toString('hex', 64) + sig.s.toString('hex', 64);

    const sbytes = bytes + signature;
    return {
      bytes,
      sig: b58cencode(signature, prefix.sig),
      prefixSig: b58cencode(signature, pref[this.curve].sig),
      sbytes,
    };
  }

  /**
   * @returns Encoded public key
   */
  publicKey(): string {
    return b58cencode(this._publicKey, pref[this.curve].pk);
  }

  /**
   * @returns Encoded public key hash
   */
  publicKeyHash(): string {
    return b58cencode(blake.blake2b(new Uint8Array(this._publicKey), undefined, 20), pref[this.curve].pkh);
  }

  /**
   * @returns Encoded private key
   */
  secretKey(): string {
    const key = this._key;

    return b58cencode(key, pref[this.curve].sk);
  }
}

/**
 * @description Tz3 key class using the p256 curve
 */
export const Tz3 = ECKey.bind(null, 'p256');

/**
 * @description Tz2 key class using the secp256k1 curve
 */
export const Tz2 = ECKey.bind(null, 'secp256k1');
