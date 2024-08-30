import { params as params8, storage as storage8 } from '../data/sample8.js';
import { ParameterSchema } from '../src/schema/parameter.js';
import { Schema } from '../src/schema/storage.js';

describe('Schema test', () => {
  it('Should parse storage properly', () => {
    const schema = new ParameterSchema(params8);
    const storage = schema.ExtractSchema();
    expect(storage).toEqual('string');
    expect(schema.generateSchema()).toEqual({
      __michelsonType: "string",
      schema: 'string'
    });
    expect({ string: 'test' }).toEqual(schema.Encode('test'));
    expect(schema.isMultipleEntryPoint).toBeFalsy();

    expect(schema.ExtractSignatures()).toContainEqual(['string']);
  });
  it('Should encode storage properly', () => {
    const schema = new Schema(storage8);
    expect(schema.Encode('test')).toEqual({ string: 'test' });
  });
});
