import { Handler, MetadataProvider } from '../src/metadata-provider';
import { InvalidMetadata, InvalidUri } from '../src/tzip16-errors';

describe('Metadata provider test', () => {
  let metadataProvider: MetadataProvider;
  let handlers: Map<string, Handler>;
  const mockContractAbstraction: any = {};
  const mockContext: any = {};
  let mockHttpHandler: {
    getMetadata: jest.Mock<any, any>;
  };
  let mockTezosStorageHandler: {
    getMetadata: jest.Mock<any, any>;
  };
  let mockIpfsHttpHandler: {
    getMetadata: jest.Mock<any, any>;
  };

  beforeEach(() => {
    mockHttpHandler = {
      getMetadata: jest.fn(),
    };
    mockTezosStorageHandler = {
      getMetadata: jest.fn(),
    };
    mockIpfsHttpHandler = {
      getMetadata: jest.fn(),
    };
    handlers = new Map<string, Handler>([
      ['http', mockHttpHandler],
      ['https', mockHttpHandler],
      ['tezos-storage', mockTezosStorageHandler],
      ['ipfs', mockIpfsHttpHandler],
    ]);
    metadataProvider = new MetadataProvider(handlers);
  });

  it('Should succesfully fetch metadata on https', async () => {
    mockHttpHandler.getMetadata.mockResolvedValue(
      `{"name":"test","description":"A metadata test","version":"0.1","license":"MIT","authors":["Taquito <https://tezostaquito.io/>"],"homepage":"https://tezostaquito.io/"}`
    );

    const metadata = await metadataProvider.provideMetadata(
      mockContractAbstraction,
      'https://storage.googleapis.com/tzip-16/metadata.json',
      mockContext
    );

    expect(metadata).toMatchObject({
      uri: 'https://storage.googleapis.com/tzip-16/metadata.json',
      metadata: {
        name: 'test',
        description: 'A metadata test',
        version: '0.1',
        license: 'MIT',
        authors: ['Taquito <https://tezostaquito.io/>'],
        homepage: 'https://tezostaquito.io/',
      },
      integrityCheckResult: undefined,
      sha256Hash: undefined,
    });

  });

  it('Should succesfully fetch metadata on http', async () => {
    mockHttpHandler.getMetadata.mockResolvedValue(`{"name":"test"}`);

    const metadata = await metadataProvider.provideMetadata(
      mockContractAbstraction,
      'http://storage.googleapis.com/tzip-16/metadata.json',
      mockContext
    );

    expect(metadata).toMatchObject({
      uri: 'http://storage.googleapis.com/tzip-16/metadata.json',
      metadata: { name: 'test' },
      integrityCheckResult: undefined,
      sha256Hash: undefined,
    });

  });

  it('Should succesfully fetch metadata for tezos-storage', async () => {
    mockTezosStorageHandler.getMetadata.mockResolvedValue(
      `{"name":"test","description":"A metadata test","version":"0.1","license":"MIT","authors":["Taquito <https://tezostaquito.io/>"],"homepage":"https://tezostaquito.io/"}`
    );

    const metadata = await metadataProvider.provideMetadata(
      mockContractAbstraction,
      'tezos-storage://KT1QDFEu8JijYbsJqzoXq7mKvfaQQamHD1kX/%2Ffoo',
      mockContext
    );

    expect(metadata).toMatchObject({
      uri: 'tezos-storage://KT1QDFEu8JijYbsJqzoXq7mKvfaQQamHD1kX/%2Ffoo',
      metadata: {
        name: 'test',
        description: 'A metadata test',
        version: '0.1',
        license: 'MIT',
        authors: ['Taquito <https://tezostaquito.io/>'],
        homepage: 'https://tezostaquito.io/',
      },
      integrityCheckResult: undefined,
      sha256Hash: undefined,
    });

  });

  it('Should succesfully fetch metadata for IPFS', async () => {
    mockIpfsHttpHandler.getMetadata.mockResolvedValue(
      `{"name":"test","description":"A metadata test","version":"0.1","license":"MIT","authors":["Taquito <https://tezostaquito.io/>"],"homepage":"https://tezostaquito.io/"}`
    );

    const metadata = await metadataProvider.provideMetadata(
      mockContractAbstraction,
      'ipfs://QmcMUKkhXowQjCPtDVVXyFJd7W9LmC92Gs5kYH1KjEisdj',
      mockContext
    );

    expect(metadata).toMatchObject({
      uri: 'ipfs://QmcMUKkhXowQjCPtDVVXyFJd7W9LmC92Gs5kYH1KjEisdj',
      metadata: {
        name: 'test',
        description: 'A metadata test',
        version: '0.1',
        license: 'MIT',
        authors: ['Taquito <https://tezostaquito.io/>'],
        homepage: 'https://tezostaquito.io/',
      },
      integrityCheckResult: undefined,
      sha256Hash: undefined,
    });

  });

  it('Should fail with InvalidUri', async () => {
    try {
      await metadataProvider.provideMetadata(
        mockContractAbstraction,
        'This-uri-is-invalid',
        mockContext
      );
    } catch (ex) {
      expect(ex).toBeInstanceOf(InvalidUri);
    }

  });

  it('Should fail with InvalidMetadata when metadata are not a JSON object', async () => {
    mockHttpHandler.getMetadata.mockResolvedValue(
      `"description": "Invalid metadata, not in JSON format"`
    );
    try {
      await metadataProvider.provideMetadata(mockContractAbstraction, 'https://test', mockContext);
    } catch (ex) {
      expect(ex).toBeInstanceOf(InvalidMetadata);
    }

  });

  it('Should extract protocol info properly', () => {
    expect(
      metadataProvider['extractProtocolInfo'](
        'tezos-storage://KT1RF4nXUitQb2G8TE5H9zApatxeKLtQymtg/here'
      )
    ).toMatchObject({
      sha256hash: undefined,
      protocol: 'tezos-storage',
      location: '//KT1RF4nXUitQb2G8TE5H9zApatxeKLtQymtg/here',
    });

    expect(metadataProvider['extractProtocolInfo']('tezos-storage:hello%2Fworld')).toMatchObject({
      sha256hash: undefined,
      protocol: 'tezos-storage',
      location: 'hello%2Fworld',
    });

    expect(metadataProvider['extractProtocolInfo']('tezos-storage:hello')).toMatchObject({
      sha256hash: undefined,
      protocol: 'tezos-storage',
      location: 'hello',
    });

    expect(
      metadataProvider['extractProtocolInfo'](
        'tezos-storage://KT1GPDQvmV37orH1XH3SZmVVKFaMuzzqsmN7.mainnet/contents'
      )
    ).toMatchObject({
      sha256hash: undefined,
      protocol: 'tezos-storage',
      location: '//KT1GPDQvmV37orH1XH3SZmVVKFaMuzzqsmN7.mainnet/contents',
    });

    expect(
      metadataProvider['extractProtocolInfo'](
        'sha256://0xeaa42ea06b95d7917d22135a630e65352cfd0a721ae88155a1512468a95cb750/https:%2F%2Ftezos.com'
      )
    ).toMatchObject({
      sha256hash: 'eaa42ea06b95d7917d22135a630e65352cfd0a721ae88155a1512468a95cb750',
      protocol: 'https',
      location: '%2F%2Ftezos.com',
    });

    expect(
      metadataProvider['extractProtocolInfo']('https://storage.googleapis.com/tzip-16/invalid.json')
    ).toMatchObject({
      sha256hash: undefined,
      protocol: 'https',
      location: '//storage.googleapis.com/tzip-16/invalid.json',
    });

    expect(
      metadataProvider['extractProtocolInfo']('http://storage.googleapis.com/tzip-16/invalid.json')
    ).toMatchObject({
      sha256hash: undefined,
      protocol: 'http',
      location: '//storage.googleapis.com/tzip-16/invalid.json',
    });

    expect(metadataProvider['extractProtocolInfo']('hello/world')).toBeUndefined();
  });
});
