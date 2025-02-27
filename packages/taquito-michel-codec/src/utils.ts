import { Prim, Expr, StringLiteral, IntLiteral } from './micheline';
import { decodeBase58Check, encodeBase58Check } from './base58';
import {
  MichelsonData,
  MichelsonDataPair,
  MichelsonType,
  MichelsonTypePair,
} from './michelson-types';
import { HexParseError, LongIntegerError, TezosIdEncodeError } from './error';

export type Tuple<N extends number, T> = N extends 1
  ? [T]
  : N extends 2
  ? [T, T]
  : N extends 3
  ? [T, T, T]
  : N extends 4
  ? [T, T, T, T]
  : N extends 5
  ? [T, T, T, T, T]
  : N extends 6
  ? [T, T, T, T, T, T]
  : N extends 7
  ? [T, T, T, T, T, T, T]
  : N extends 8
  ? [T, T, T, T, T, T, T, T]
  : T[];

type RequiredProp<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
type OmitProp<T, K extends keyof T> = Omit<T, K> & { [P in K]?: undefined };

export type ReqArgs<T extends Prim> = RequiredProp<T, 'args'>;
export type NoArgs<T extends Prim> = OmitProp<T, 'args'>;
export type NoAnnots<T extends Prim> = OmitProp<T, 'annots'>;

export type Nullable<T> = { [P in keyof T]: T[P] | null };

/**
 *  @category Error
 *  @description Error that indicates a Michelson failure occurring
 */
export class MichelsonError<T extends Expr = Expr> extends Error {
  /**
   * @param val Value of a AST node caused the error
   * @param path Path to a node caused the error
   * @param message An error message
   */
  constructor(public val: T, message?: string) {
    super(message);
    Object.setPrototypeOf(this, MichelsonError.prototype);
  }
}

export function isMichelsonError<T extends Expr = Expr>(err: unknown): err is MichelsonError<T> {
  return err instanceof MichelsonError;
}

export class MichelsonTypeError extends MichelsonError<MichelsonType | MichelsonType[]> {
  public data?: Expr;

  /**
   * @param val Value of a type node caused the error
   * @param data Value of a data node caused the error
   * @param message An error message
   */
  constructor(val: MichelsonType | MichelsonType[], data?: Expr, message?: string) {
    super(val, message);
    if (data !== undefined) {
      this.data = data;
    }
    Object.setPrototypeOf(this, MichelsonTypeError.prototype);
  }
}

// Ad hoc big integer parser
export class LongInteger {
  private neg = false;
  private buf: number[] = [];

  private append(c: number) {
    let i = 0;
    while (c !== 0 || i < this.buf.length) {
      const m = (this.buf[i] || 0) * 10 + c;
      this.buf[i++] = m % 256;
      c = Math.floor(m / 256);
    }
  }

  constructor(arg?: string | number) {
    if (arg === undefined) {
      return;
    }
    if (typeof arg === 'string') {
      for (let i = 0; i < arg.length; i++) {
        const c = arg.charCodeAt(i);
        if (i === 0 && c === 0x2d) {
          this.neg = true;
        } else {
          if (c < 0x30 || c > 0x39) {
            throw new LongIntegerError(`unexpected character in integer constant: ${arg[i]}`);
          }
          this.append(c - 0x30);
        }
      }
    } else if (arg < 0) {
      this.neg = true;
      this.append(-arg);
    } else {
      this.append(arg);
    }
  }

  cmp(arg: LongInteger): number {
    if (this.neg !== arg.neg) {
      return (arg.neg ? 1 : 0) - (this.neg ? 1 : 0);
    } else {
      let ret = 0;
      if (this.buf.length !== arg.buf.length) {
        ret = this.buf.length < arg.buf.length ? -1 : 1;
      } else if (this.buf.length !== 0) {
        let i = arg.buf.length - 1;
        while (i >= 0 && this.buf[i] === arg.buf[i]) {
          i--;
        }
        ret = i < 0 ? 0 : this.buf[i] < arg.buf[i] ? -1 : 1;
      }
      return !this.neg ? ret : ret === 0 ? 0 : -ret;
    }
  }

  get sign(): number {
    return this.buf.length === 0 ? 0 : this.neg ? -1 : 1;
  }
}

export function parseBytes(s: string): number[] | null {
  const ret: number[] = [];
  if (s.length % 2 !== 0) {
    throw new Error(`expected ${s} to have even length`)
  }
  for (let i = 0; i < s.length; i += 2) {
    const x = parseInt(s.slice(i, i + 2), 16);
    if (Number.isNaN(x)) {
      return null;
    }
    ret.push(x);
  }
  return ret;
}

export function compareBytes(a: number[] | Uint8Array, b: number[] | Uint8Array): number {
  if (a.length !== b.length) {
    return a.length < b.length ? -1 : 1;
  } else if (a.length !== 0) {
    let i = 0;
    while (i < a.length && a[i] === b[i]) {
      i++;
    }
    return i === a.length ? 0 : a[i] < b[i] ? -1 : 1;
  } else {
    return 0;
  }
}

export function isDecimal(x: string): boolean {
  try {
    new LongInteger(x);
    return true;
  } catch {
    return false;
  }
}

export function isNatural(x: string): boolean {
  try {
    return new LongInteger(x).sign >= 0;
  } catch {
    return false;
  }
}

export interface UnpackedAnnotations {
  f?: string[];
  t?: string[];
  v?: string[];
}

export interface UnpackAnnotationsOptions {
  specialVar?: boolean; // CAR, CDR
  emptyVar?: boolean;
  specialFields?: boolean; // PAIR, LEFT, RIGHT
  emptyFields?: boolean;
}

const annRe = /^(@%|@%%|%@|[@:%]([_0-9a-zA-Z][_0-9a-zA-Z.%@]*)?)$/;

export function unpackAnnotations(
  p: Prim | Expr[],
  opt?: UnpackAnnotationsOptions
): UnpackedAnnotations {
  if (Array.isArray(p)) {
    return {};
  }

  let field: string[] | undefined;
  let type: string[] | undefined;
  let vars: string[] | undefined;

  if (p.annots !== undefined) {
    for (const v of p.annots) {
      if (v.length !== 0) {
        if (
          !annRe.test(v) ||
          (!opt?.specialVar && (v === '@%' || v === '@%%')) ||
          (!opt?.specialFields && v === '%@')
        ) {
          throw new MichelsonError(p, `${p.prim}: unexpected annotation: ${v}`);
        }

        switch (v[0]) {
          case '%':
            if (opt?.emptyFields || v.length > 1) {
              field = field || [];
              field.push(v);
            }
            break;
          case ':':
            if (v.length > 1) {
              type = type || [];
              type.push(v);
            }
            break;
          case '@':
            if (opt?.emptyVar || v.length > 1) {
              vars = vars || [];
              vars.push(v);
            }
            break;
        }
      }
    }
  }
  return { f: field, t: type, v: vars };
}

export type TezosIDType =
  | 'BlockHash'
  | 'OperationHash'
  | 'OperationListHash'
  | 'OperationListListHash'
  | 'ProtocolHash'
  | 'ContextHash'
  | 'ED25519PublicKeyHash'
  | 'SECP256K1PublicKeyHash'
  | 'P256PublicKeyHash'
  | 'ContractHash'
  | 'CryptoboxPublicKeyHash'
  | 'ED25519Seed'
  | 'ED25519PublicKey'
  | 'SECP256K1SecretKey'
  | 'P256SecretKey'
  | 'ED25519EncryptedSeed'
  | 'SECP256K1EncryptedSecretKey'
  | 'P256EncryptedSecretKey'
  | 'SECP256K1PublicKey'
  | 'P256PublicKey'
  | 'SECP256K1Scalar'
  | 'SECP256K1Element'
  | 'ED25519SecretKey'
  | 'ED25519Signature'
  | 'SECP256K1Signature'
  | 'P256Signature'
  | 'GenericSignature'
  | 'ChainID'
  | 'RollupAddress'
  | 'TxRollupL2Address';

export type TezosIDPrefix = [number, number[]]; // payload length, prefix

export const tezosPrefix: Record<TezosIDType, TezosIDPrefix> = {
  BlockHash: [32, [1, 52]], // B(51)
  OperationHash: [32, [5, 116]], // o(51)
  OperationListHash: [32, [133, 233]], // Lo(52)
  OperationListListHash: [32, [29, 159, 109]], // LLo(53)
  ProtocolHash: [32, [2, 170]], // P(51)
  ContextHash: [32, [79, 199]], // Co(52)
  ED25519PublicKeyHash: [20, [6, 161, 159]], // tz1(36)
  SECP256K1PublicKeyHash: [20, [6, 161, 161]], // tz2(36)
  P256PublicKeyHash: [20, [6, 161, 164]], // tz3(36)
  ContractHash: [20, [2, 90, 121]], // KT1(36)
  CryptoboxPublicKeyHash: [16, [153, 103]], // id(30)
  ED25519Seed: [32, [13, 15, 58, 7]], // edsk(54)
  ED25519PublicKey: [32, [13, 15, 37, 217]], // edpk(54)
  SECP256K1SecretKey: [32, [17, 162, 224, 201]], // spsk(54)
  P256SecretKey: [32, [16, 81, 238, 189]], // p2sk(54)
  ED25519EncryptedSeed: [56, [7, 90, 60, 179, 41]], // edesk(88)
  SECP256K1EncryptedSecretKey: [56, [9, 237, 241, 174, 150]], // spesk(88)
  P256EncryptedSecretKey: [56, [9, 48, 57, 115, 171]], // p2esk(88)
  SECP256K1PublicKey: [33, [3, 254, 226, 86]], // sppk(55)
  P256PublicKey: [33, [3, 178, 139, 127]], // p2pk(55)
  SECP256K1Scalar: [33, [38, 248, 136]], // SSp(53)
  SECP256K1Element: [33, [5, 92, 0]], // GSp(54)
  ED25519SecretKey: [64, [43, 246, 78, 7]], // edsk(98)
  ED25519Signature: [64, [9, 245, 205, 134, 18]], // edsig(99)
  SECP256K1Signature: [64, [13, 115, 101, 19, 63]], // spsig1(99)
  P256Signature: [64, [54, 240, 44, 52]], // p2sig(98)
  GenericSignature: [64, [4, 130, 43]], // sig(96)
  ChainID: [4, [87, 82, 0]],
  RollupAddress: [20, [1, 128, 120, 31]],
  TxRollupL2Address: [20, [6, 161, 166]],
};

export function checkDecodeTezosID<T extends TezosIDType[]>(
  id: string,
  ...types: T
): [T[number], number[]] | null {
  const buf = decodeBase58Check(id);
  for (const t of types) {
    const [plen, p] = tezosPrefix[t];
    if (buf.length === plen + p.length) {
      let i = 0;
      while (i < p.length && buf[i] === p[i]) {
        i++;
      }
      if (i === p.length) {
        return [t, buf.slice(p.length)];
      }
    }
  }
  return null;
}

export function encodeTezosID(id: TezosIDType, data: number[] | Uint8Array): string {
  const [plen, p] = tezosPrefix[id];
  if (data.length !== plen) {
    throw new TezosIdEncodeError(`Incorrect data length for ${id}: ${data.length}`);
  }
  return encodeBase58Check([...p, ...data]);
}

// reassemble comb pair for transparent comparison etc. non-recursive!
type PairTypeOrDataPrim<I extends 'pair' | 'Pair'> = I extends 'pair'
  ? Extract<MichelsonTypePair<MichelsonType[]>, Prim>
  : Extract<MichelsonDataPair<MichelsonData[]>, Prim>;
export function unpackComb<I extends 'pair' | 'Pair'>(
  id: I,
  v: I extends 'pair' ? MichelsonTypePair<MichelsonType[]> : MichelsonDataPair<MichelsonData[]>
): PairTypeOrDataPrim<I> {
  const vv: MichelsonTypePair<MichelsonType[]> | MichelsonDataPair<MichelsonData[]> = v;
  const args = Array.isArray(vv) ? vv : vv.args;
  if (args.length === 2) {
    // it's a way to make a union of two interfaces not an interface with two independent properties of union types
    const ret =
      id === 'pair'
        ? {
            prim: 'pair',
            args,
          }
        : {
            prim: 'Pair',
            args,
          };
    return ret as PairTypeOrDataPrim<I>;
  }

  return {
    ...(Array.isArray(vv) ? { prim: id } : vv),
    args: [
      args[0],
      {
        prim: id,
        args: args.slice(1),
      },
    ],
  } as PairTypeOrDataPrim<I>;
}

export function isPairType(t: MichelsonType): t is MichelsonTypePair<MichelsonType[]> {
  return Array.isArray(t) || t.prim === 'pair';
}

export function isPairData(d: Expr): d is MichelsonDataPair<MichelsonData[]> {
  return Array.isArray(d) || ('prim' in d && d.prim === 'Pair');
}

const rfc3339Re =
  /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])[T ]([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(\.[0-9]+)?(Z|[+-]([01][0-9]|2[0-3]):([0-5][0-9]))$/;

export function parseDate(a: StringLiteral | IntLiteral): Date | null {
  if ('string' in a) {
    if (isNatural(a.string)) {
      return new Date(parseInt(a.string, 10));
    } else if (rfc3339Re.test(a.string)) {
      const x = new Date(a.string);
      if (!Number.isNaN(x.valueOf)) {
        return x;
      }
    }
  } else if (isDecimal(a.int)) {
    return new Date(parseInt(a.int, 10));
  }
  return null;
}

export function parseHex(s: string): number[] {
  const res: number[] = [];
  for (let i = 0; i < s.length; i += 2) {
    const ss = s.slice(i, i + 2);
    const x = parseInt(ss, 16);
    if (Number.isNaN(x)) {
      throw new HexParseError(ss);
    }
    res.push(x);
  }
  return res;
}

export function hexBytes(bytes: number[]): string {
  return bytes.map((x) => ((x >> 4) & 0xf).toString(16) + (x & 0xf).toString(16)).join('');
}
