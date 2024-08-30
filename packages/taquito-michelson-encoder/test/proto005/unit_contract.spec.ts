import { params } from '../../data/proto005/unit_contract.js';
import { ParameterSchema } from '../../src/schema/parameter.js';
import { UnitValue } from '../../src/taquito-michelson-encoder.js';

describe('Contract with unit encoding', () => {
  it('Should encode parameter properly', () => {
    const schema = new ParameterSchema(params);
    expect(schema.Encode('deposit', UnitValue)).toEqual({ prim: 'Left', args: [{ prim: 'Unit' }] });
  });

  it('Should extract signature properly', () => {
    const schema = new ParameterSchema(params);
    expect(schema.ExtractSignatures()).toContainEqual(['deposit', 'unit']);
  });
});
