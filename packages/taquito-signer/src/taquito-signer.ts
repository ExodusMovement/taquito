/**
 * @packageDocumentation
 * @module @exodus/taquito-signer
 */
import * as nacl from "tweetnacl";
import blake from '@exodus/blakejs';
import { hex2buf, mergebuf, b58cencode, prefix, InvalidKeyError } from '@exodus/taquito-utils';
import toBuffer from 'typedarray-to-buffer';
import { Tz1 } from './ed-key';
import { Tz2, ECKey, Tz3 } from './ec-key';
import pbkdf2 from 'pbkdf2';
import * as Bip39 from 'bip39';
import { Curves, generateSecretKey } from './helpers';
import { InvalidMnemonicError } from './errors';

export * from './import-key';
export { VERSION } from './version';
export * from './derivation-tools';
export * from './helpers';

/**
 *  @category Error
 *  @description Error that indicates an invalid passphrase being passed or used
 */
export class InvalidPassphraseError extends Error {
  public name = 'InvalidPassphraseError';
  constructor(public message: string) {
    super(message);
  }
}

export interface FromMnemonicParams {
  mnemonic: string;
  password?: string;
  derivationPath?: string;
  curve?: Curves;
}

/**
 * @description A local implementation of the signer. Will represent a Tezos account and be able to produce signature in its behalf
 *
 * @warn If running in production and dealing with tokens that have real value, it is strongly recommended to use a HSM backed signer so that private key material is not stored in memory or on disk
 *
 */
export class InMemorySigner {
  private _key!: Tz1 | ECKey;

  static fromFundraiser(email: string, password: string, mnemonic: string) {
    if (!Bip39.validateMnemonic(mnemonic)) {
      throw new InvalidMnemonicError(`Invalid mnemonic: ${mnemonic}`);
    }
    const seed = Bip39.mnemonicToSeedSync(mnemonic, `${email}${password}`);
    const key = b58cencode(seed.slice(0, 32), prefix.edsk2);
    return new InMemorySigner(key);
  }

  static fromSecretKey(key: string, passphrase?: string) {
    return new InMemorySigner(key, passphrase);
  }

  /**
   *
   * @description Instantiation of an InMemorySigner instance from a mnemonic
   * @param mnemonic 12-24 word mnemonic
   * @param password password used to encrypt the mnemonic to seed value
   * @param derivationPath default 44'/1729'/0'/0' (44'/1729' mandatory)
   * @param curve currently only supported for tz1, tz2, tz3 addresses. soon bip25519
   * @returns InMemorySigner
   */
  static fromMnemonic({ mnemonic, password = '', derivationPath = "44'/1729'/0'/0'", curve = 'ed25519' }: FromMnemonicParams) {
    // check if curve is defined if not default tz1
    if (!Bip39.validateMnemonic(mnemonic)) {
      // avoiding exposing mnemonic again in case of mistake making invalid
      throw new InvalidMnemonicError('Mnemonic provided is invalid');
    }
    const seed = Bip39.mnemonicToSeedSync(mnemonic, password);

    const sk = generateSecretKey(seed, derivationPath, curve);

    return new InMemorySigner(sk);
  }
  /**
   *
   * @param key Encoded private key
   * @param passphrase Passphrase to decrypt the private key if it is encrypted
   *
   */
  constructor(key: string, passphrase?: string) {
    const encrypted = key.substring(2, 3) === 'e';

    let decrypt = (k: any) => k;

    if (encrypted) {
      if (!passphrase) {
        throw new InvalidPassphraseError('Encrypted key provided without a passphrase.');
      }

      decrypt = (constructedKey: Uint8Array) => {
        const salt = toBuffer(constructedKey.slice(0, 8));
        const encryptedSk = constructedKey.slice(8);
        const encryptionKey = pbkdf2.pbkdf2Sync(passphrase, salt, 32768, 32, 'sha512');

        return nacl.secretbox.open(
          new Uint8Array(encryptedSk),
          new Uint8Array(24),
          new Uint8Array(encryptionKey)
        );
      };
    }

    switch (key.substr(0, 4)) {
      case 'edes':
      case 'edsk':
        this._key = new Tz1(key, encrypted, decrypt);
        break;
      case 'spsk':
      case 'spes':
        this._key = new Tz2(key, encrypted, decrypt);
        break;
      case 'p2sk':
      case 'p2es':
        this._key = new Tz3(key, encrypted, decrypt);
        break;
      default:
        throw new InvalidKeyError(key, 'Unsupported key type');
    }
  }

  /**
   *
   * @param bytes Bytes to sign
   * @param watermark Watermark to append to the bytes
   */
  sign(bytes: string, watermark?: Uint8Array) {
    let bb = hex2buf(bytes);
    if (typeof watermark !== 'undefined') {
      bb = mergebuf(watermark, bb);
    }

    const bytesHash = blake.blake2b(bb, undefined, 32);

    return this._key.sign(bytes, bytesHash);
  }

  /**
   * @returns Encoded public key
   */
  publicKey(): string {
    return this._key.publicKey();
  }

  /**
   * @returns Encoded public key hash
   */
  publicKeyHash(): string {
    return this._key.publicKeyHash();
  }

  /**
   * @returns Encoded private key
   */
  secretKey(): string {
    return this._key.secretKey();
  }
}
