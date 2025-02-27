import { b58cencode, bytes2Char, Prefix, prefix } from '@exodus/taquito-utils';
import BigNumber from 'bignumber.js';
import { Input } from '../types';

export function memoHexToUtf8(memo: string) {
  const memoNoPadding = removeZeroPaddedBytesRight(memo);
  return memoNoPadding === '' ? memoNoPadding : bytes2Char(memoNoPadding);
}

function removeZeroPaddedBytesRight(memo: string) {
  const matchZeroRight = memo.match(/^(.*?)(00)+$/);
  return matchZeroRight ? matchZeroRight[1] : memo;
}

export function readableFormat(saplingTransactionProperties: Omit<Input, 'position'>) {
  return {
    value: convertValueToBigNumber(saplingTransactionProperties.value),
    memo: memoHexToUtf8(Buffer.from(saplingTransactionProperties.memo).toString('hex')),
    paymentAddress: b58cencode(saplingTransactionProperties.paymentAddress, prefix[Prefix.ZET1]),
  };
}

export function convertValueToBigNumber(value: Uint8Array) {
  return new BigNumber(Buffer.from(value).toString('hex'), 16);
}

export function bufToUint8Array(buffer: Buffer) {
  return new Uint8Array(
    buffer.buffer,
    buffer.byteOffset,
    buffer.byteLength / Uint8Array.BYTES_PER_ELEMENT
  );
}
