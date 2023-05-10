export const concat = (...arr: Uint8Array[]) => {
  return arr.reduce((a: Uint8Array, b: Uint8Array) => {
    const c = new Uint8Array(a.length + b.length);
    c.set(a);
    c.set(b, a.length);
    return c;
  }, new Uint8Array());
};

export const toHexString = (bytes: Uint8Array) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

export const pad = (num: number, paddingLen = 8) => {
  const ret = num.toString(16).padStart(paddingLen, '0');
  if (ret.length !== paddingLen) {
    throw new Error(`expected padded string to be of length ${paddingLen}, but it's length is ${ret.length}`)
  }
  return ret;
};
