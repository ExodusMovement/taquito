import { Prim, Expr } from './micheline.js';
import { GlobalConstantHashAndValue } from './micheline-parser.js';

export function expandGlobalConstants(ex: Prim, hashAndValue: GlobalConstantHashAndValue): Expr {
  if (
    ex.args !== undefined &&
    ex.args.length === 1 &&
    'string' in ex.args[0] &&
    Object.prototype.hasOwnProperty.call(hashAndValue, ex.args[0].string)
  ) {
    return hashAndValue[ex.args[0].string];
  }

  return ex;
}
