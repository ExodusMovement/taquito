import { Tzip16ContractAbstraction } from '../src/tzip16-contract-abstraction';
import { BigMapMetadataNotFound, UriNotFound } from '../src/tzip16-errors';

describe('Tzip16 contract abstraction test', () => {
  let mockMetadataProvider: {
    provideMetadata: jest.Mock<any, any>;
  };
  const mockContractAbstraction: any = {};
  let mockSchema: {
    FindFirstInTopLevelPair: jest.Mock<any, any>;
  };
  const mockContext: any = {};

  let mockRpcContractProvider: {
    getBigMapKeyByID: jest.Mock<any, any>;
  };

  let mockReadProvider: {
    getStorage: jest.Mock<any, any>;
  };

  beforeEach(() => {
    mockMetadataProvider = {
      provideMetadata: jest.fn(),
    };

    mockSchema = {
      FindFirstInTopLevelPair: jest.fn(),
    };

    mockRpcContractProvider = {
      getBigMapKeyByID: jest.fn(),
    };

    mockReadProvider = {
      getStorage: jest.fn(),
    };

    mockMetadataProvider.provideMetadata.mockResolvedValue({
      uri: 'https://test',
      metadata: {
        name: 'Taquito test',
        description: 'A metadata test',
        version: '0.1',
        license: 'MIT',
        authors: ['Test <https://test/>'],
        homepage: 'https://test/',
      },
    });

    mockContext['metadataProvider'] = mockMetadataProvider;
    mockContext['contract'] = mockRpcContractProvider;
    mockContext['readProvider'] = mockReadProvider;

    mockContractAbstraction['schema'] = mockSchema;
    mockReadProvider.getStorage.mockResolvedValue({
      prim: 'Pair',
      args: [
        {
          int: '20350',
        },
        [],
      ],
    });
  });

  it('Should get the metadata', async () => {
    mockSchema.FindFirstInTopLevelPair.mockReturnValue({ int: '20350' });
    mockRpcContractProvider.getBigMapKeyByID.mockResolvedValue('cafe');

    const tzip16Abs = new Tzip16ContractAbstraction(mockContractAbstraction as any, mockContext);
    const metadata = await tzip16Abs.getMetadata();

    expect(metadata.metadata).toEqual({
      name: 'Taquito test',
      description: 'A metadata test',
      version: '0.1',
      license: 'MIT',
      authors: ['Test <https://test/>'],
      homepage: 'https://test/',
    });

  });

  it('Should get metadata by each property', async () => {
    mockSchema.FindFirstInTopLevelPair.mockReturnValue({ int: '20350' });
    mockRpcContractProvider.getBigMapKeyByID.mockResolvedValue('cafe');

    const tzip16Abs = new Tzip16ContractAbstraction(mockContractAbstraction as any, mockContext);

    expect(await tzip16Abs.metadataName()).toEqual('Taquito test');
    expect(await tzip16Abs.metadataDescription()).toEqual('A metadata test');
    expect(await tzip16Abs.metadataVersion()).toEqual('0.1');
    expect(await tzip16Abs.metadataLicense()).toEqual('MIT');
    expect(await tzip16Abs.metadataAuthors()).toEqual(['Test <https://test/>']);
    expect(await tzip16Abs.metadataHomepage()).toEqual('https://test/');
    expect(await tzip16Abs.metadataSource()).toBeUndefined();
    expect(await tzip16Abs.metadataInterfaces()).toBeUndefined();
    expect(await tzip16Abs.metadataErrors()).toBeUndefined();
    expect(await tzip16Abs.metadataViews()).toEqual({});


  });

  it('Should fail with BigMapMetadataNotFound', async () => {
    mockSchema.FindFirstInTopLevelPair.mockReturnValue(undefined);

    const tzip16Abs = new Tzip16ContractAbstraction(mockContractAbstraction as any, mockContext);

    try {
      await tzip16Abs.getMetadata();
    } catch (e) {
      expect(e).toBeInstanceOf(BigMapMetadataNotFound);
    }

  });

  it('Should fail with UriNotFound', async () => {
    mockSchema.FindFirstInTopLevelPair.mockReturnValue({ int: '20350' });
    mockRpcContractProvider.getBigMapKeyByID.mockResolvedValue(undefined);

    const tzip16Abs = new Tzip16ContractAbstraction(mockContractAbstraction as any, mockContext);

    try {
      await tzip16Abs.getMetadata();
    } catch (e) {
      expect(e).toBeInstanceOf(UriNotFound);
    }

  });

  it('Should properly add a valid view to the _metadataViewsObject property', async () => {
    const tzip16Abs = new Tzip16ContractAbstraction(mockContractAbstraction as any, mockContext);
    // Act as we already fetched metadata; it contains one view
    tzip16Abs['_metadataEnvelope'] = {
      uri: '',
      metadata: {
        views: [
          {
            name: 'multiply-the-nat-in-storage',
            implementations: [
              {
                michelsonStorageView: {
                  parameter: { prim: 'nat', args: [], annots: [] },
                  returnType: { prim: 'nat', args: [], annots: [] },
                  code: [
                    { prim: 'DUP', args: [], annots: [] },
                    { prim: 'CDR', args: [], annots: [] },
                    { prim: 'CAR', args: [], annots: [] },
                    { prim: 'SWAP', args: [], annots: [] },
                    { prim: 'CAR', args: [], annots: [] },
                    { prim: 'MUL', args: [], annots: [] },
                  ],
                },
              },
            ],
          },
        ],
      },
    };
    // Return an object where the key is the view name and the value is a function which return a View instance
    const metadataView = await tzip16Abs.metadataViews();
    expect(Object.keys(metadataView)[0]).toEqual('multiply-the-nat-in-storage');
    expect(typeof Object.values(metadataView)[0]).toBe('function');
    expect(tzip16Abs['_metadataViewsObject']).toEqual(metadataView);

  });

  it('The _metadataViewsObject property should be empty when there is no view in metadata', async () => {
    const tzip16Abs = new Tzip16ContractAbstraction(mockContractAbstraction as any, mockContext);
    // Act as we already fetched metadata; it contains no view
    tzip16Abs['_metadataEnvelope'] = {
      uri: '',
      metadata: {
        views: [],
      },
    };
    // Return an empty object
    const metadataView = await tzip16Abs.metadataViews();
    expect(metadataView).toEqual({});
    expect(tzip16Abs['_metadataViewsObject']).toEqual(metadataView);

  });

  it('The _metadataViewsObject property should be empty when there is no view property in metadata', async () => {
    const tzip16Abs = new Tzip16ContractAbstraction(mockContractAbstraction as any, mockContext);
    // Act as we already fetched metadata; it contains no view
    tzip16Abs['_metadataEnvelope'] = {
      uri: '',
      metadata: {},
    };
    // Return an empty object
    const metadataView = await tzip16Abs.metadataViews();
    expect(metadataView).toEqual({});

  });

  it('Should ignore view having an unsupported type', async () => {
    const tzip16Abs = new Tzip16ContractAbstraction(mockContractAbstraction as any, mockContext);
    (tzip16Abs['_metadataEnvelope'] as any) = {
      uri: '',
      metadata: {
        views: [
          {
            name: 'unknownView',
            implementations: [
              {
                unknownViewType: {
                  returnType: { prim: 'nat', args: [], annots: [] },
                  code: [{ prim: 'DUP', args: [], annots: [] }],
                },
              },
            ],
          },
        ],
      },
    };
    const metadataView = await tzip16Abs.metadataViews();
    expect(metadataView).toEqual({});
    expect(tzip16Abs['_metadataViewsObject']).toEqual(metadataView);

  });

  it('Should ignore the unsupported type of view and add the supported one to the _metadataViewsObject property', async () => {
    const tzip16Abs = new Tzip16ContractAbstraction(mockContractAbstraction as any, mockContext);
    // Act as we already fetched metadata; it contains a view having an unsupported type and a valid view
    (tzip16Abs['_metadataEnvelope'] as any) = {
      uri: '',
      metadata: {
        views: [
          {
            name: 'unknownView',
            implementations: [
              {
                unknownViewType: {
                  returnType: { prim: 'nat', args: [], annots: [] },
                  code: [{ prim: 'DUP', args: [], annots: [] }],
                },
              },
            ],
          },
          {
            name: 'multiply-the-nat-in-storage',
            implementations: [
              {
                michelsonStorageView: {
                  parameter: { prim: 'nat', args: [], annots: [] },
                  returnType: { prim: 'nat', args: [], annots: [] },
                  code: [
                    { prim: 'DUP', args: [], annots: [] },
                    { prim: 'CDR', args: [], annots: [] },
                    { prim: 'CAR', args: [], annots: [] },
                    { prim: 'SWAP', args: [], annots: [] },
                    { prim: 'CAR', args: [], annots: [] },
                    { prim: 'MUL', args: [], annots: [] },
                  ],
                },
              },
            ],
          },
        ],
      },
    };
    const metadataView = await tzip16Abs.metadataViews();
    expect(Object.keys(metadataView)[0]).toEqual('multiply-the-nat-in-storage');
    expect(Object.keys(metadataView)[1]).toBeUndefined();
    expect(tzip16Abs['_metadataViewsObject']).toEqual(metadataView);

  });

  it('Should ignore view having no code property', async () => {
    const tzip16Abs = new Tzip16ContractAbstraction(mockContractAbstraction as any, mockContext);
    (tzip16Abs['_metadataEnvelope'] as any) = {
      uri: '',
      metadata: {
        views: [
          {
            name: 'invalid-view-no-code',
            implementations: [
              {
                michelsonStorageView: {
                  parameter: { prim: 'nat', args: [], annots: [] },
                  returnType: { prim: 'nat', args: [], annots: [] },
                },
              },
            ],
          },
        ],
      },
    };
    const metadataView = await tzip16Abs.metadataViews();
    expect(metadataView).toEqual({});

  });

  it('Should ignore view having no returnType property', async () => {
    const tzip16Abs = new Tzip16ContractAbstraction(mockContractAbstraction as any, mockContext);
    (tzip16Abs['_metadataEnvelope'] as any) = {
      uri: '',
      metadata: {
        views: [
          {
            name: 'invalid-view-no-return-type',
            implementations: [
              {
                michelsonStorageView: {
                  parameter: { prim: 'nat', args: [], annots: [] },
                  code: [{ prim: 'DUP', args: [], annots: [] }],
                },
              },
            ],
          },
        ],
      },
    };
    const metadataView = await tzip16Abs.metadataViews();
    expect(metadataView).toEqual({});

  });

  it('Should ignore view having no implementation', async () => {
    const tzip16Abs = new Tzip16ContractAbstraction(mockContractAbstraction as any, mockContext);
    (tzip16Abs['_metadataEnvelope'] as any) = {
      uri: '',
      metadata: {
        views: [
          {
            name: 'invalid-view',
            implementations: [],
          },
        ],
      },
    };
    const metadataView = await tzip16Abs.metadataViews();
    expect(metadataView).toEqual({});

  });

  it('Should ignore view having no implementation property', async () => {
    const tzip16Abs = new Tzip16ContractAbstraction(mockContractAbstraction as any, mockContext);
    (tzip16Abs['_metadataEnvelope'] as any) = {
      uri: '',
      metadata: {
        views: [
          {
            name: 'invalid-view',
          },
        ],
      },
    };
    const metadataView = await tzip16Abs.metadataViews();
    expect(metadataView).toEqual({});

  });

  it('Should ignore view having no name property', async () => {
    const tzip16Abs = new Tzip16ContractAbstraction(mockContractAbstraction as any, mockContext);
    (tzip16Abs['_metadataEnvelope'] as any) = {
      uri: '',
      metadata: {
        views: [
          {
            implementations: [
              {
                michelsonStorageView: {
                  parameter: { prim: 'nat', args: [], annots: [] },
                  returnType: { prim: 'nat', args: [], annots: [] },
                  code: [{ prim: 'DUP', args: [], annots: [] }],
                },
              },
            ],
          },
        ],
      },
    };
    const metadataView = await tzip16Abs.metadataViews();
    expect(metadataView).toEqual({});

  });

  it('Should properly add a valid view to the _metadataViewsObject property', async () => {
    const tzip16Abs = new Tzip16ContractAbstraction(mockContractAbstraction as any, mockContext);
    // Act as we already fetched metadata; it contains one view
    tzip16Abs['_metadataEnvelope'] = {
      uri: '',
      metadata: {
        views: [
          {
            name: 'multiply-the-nat-in-storage',
            implementations: [
              {
                michelsonStorageView: {
                  parameter: { prim: 'nat', args: [], annots: [] },
                  returnType: { prim: 'nat', args: [], annots: [] },
                  code: [{ prim: 'DUP', args: [], annots: [] }],
                },
              },
            ],
          },
          {
            name: 'multiply-the-nat-in-storage',
            implementations: [
              {
                michelsonStorageView: {
                  parameter: { prim: 'nat', args: [], annots: [] },
                  returnType: { prim: 'nat', args: [], annots: [] },
                  code: [{ prim: 'DUP', args: [], annots: [] }],
                },
              },
            ],
          },
          {
            name: 'multiply-the-nat-in-storage',
            implementations: [
              {
                michelsonStorageView: {
                  parameter: { prim: 'nat', args: [], annots: [] },
                  returnType: { prim: 'nat', args: [], annots: [] },
                  code: [{ prim: 'DUP', args: [], annots: [] }],
                },
              },
            ],
          },
        ],
      },
    };
    const metadataView = await tzip16Abs.metadataViews();
    expect(Object.keys(metadataView)[0]).toEqual('multiply-the-nat-in-storage');
    expect(Object.keys(metadataView)[1]).toEqual('multiply-the-nat-in-storage1');
    expect(Object.keys(metadataView)[2]).toEqual('multiply-the-nat-in-storage2');
    expect(Object.keys(metadataView)[3]).toBeUndefined();

  });
});
