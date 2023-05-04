import { InvalidHexStringError } from '@exodus/taquito-utils';

export function parseHex(s: string): Uint8Array {
  const res: number[] = [];
  if (s.length % 2 !== 0) {
    throw new InvalidHexStringError(`expected hex string to have even length`)
  }
  for (let i = 0; i < s.length; i += 2) {
    const ss = s.slice(i, i + 2);
    const x = parseInt(ss, 16);
    if (Number.isNaN(x)) {
      throw new InvalidHexStringError(`invalid hexadecimal number ${ss}`);
    }
    res.push(x);
  }
  return new Uint8Array(res);
}
