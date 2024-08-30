import { MichelsonMap } from '../src/michelson-map.js';

export const expectMichelsonMap = (literal = {}) =>
  expect.objectContaining(MichelsonMap.fromLiteral(literal));
