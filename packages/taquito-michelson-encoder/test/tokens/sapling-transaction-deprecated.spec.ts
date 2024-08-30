import {
  SaplingTransactionDeprecatedToken,
  SaplingTransactionDeprecatedValidationError,
} from '../../src/tokens/sapling-transaction-deprecated.js';

describe('Sapling Transaction Deprecated token', () => {
  let token: SaplingTransactionDeprecatedToken;
  beforeEach(() => {
    token = new SaplingTransactionDeprecatedToken(
      { prim: 'sapling_transaction_deprecated', args: [{ int: '8' }], annots: [] },
      0,
      null as any
    );
  });

  describe('EncodeObject', () => {
    it('Should encode hexadecimal string to michelson bytes format', () => {
      expect(
        token.EncodeObject(
          '0x000160cafa8127c423dc44a3acad6873ad9bd7ad7720eb8f999b35a4c2595ed0b891e6'
        )
      ).toEqual({
        bytes: '000160cafa8127c423dc44a3acad6873ad9bd7ad7720eb8f999b35a4c2595ed0b891e6',
      });
      expect(
        token.EncodeObject('000160cafa8127c423dc44a3acad6873ad9bd7ad7720eb8f999b35a4c2595ed0b891e6')
      ).toEqual({
        bytes: '000160cafa8127c423dc44a3acad6873ad9bd7ad7720eb8f999b35a4c2595ed0b891e6',
      });
      expect(
        token.EncodeObject(
          'd99afc56a64520a32c5839f7b3371a5e683cd53d794383041b6d0c7034c6c2b9df76070d3c8569ef072a013ca502c18be7c06bb043e6566cec87c062ee285fdf562b24dcf97dbde33557199090912c65'
        )
      ).toEqual({
        bytes:
          'd99afc56a64520a32c5839f7b3371a5e683cd53d794383041b6d0c7034c6c2b9df76070d3c8569ef072a013ca502c18be7c06bb043e6566cec87c062ee285fdf562b24dcf97dbde33557199090912c65',
      });
    });

    it('Should encode uint8Array to michelson bytes format', () => {
      const uint8 = new Uint8Array([21, 31]);
      expect(token.EncodeObject(uint8)).toEqual({
        bytes: '151f',
      });
    });

    it('Should throw a validation error when value is not valid bytes', () => {
      expect(() => token.EncodeObject('1')).toThrowError(
        SaplingTransactionDeprecatedValidationError
      );
      expect(() => token.EncodeObject('test')).toThrowError(
        SaplingTransactionDeprecatedValidationError
      );
    });
  });

  describe('Encode', () => {
    it('Should encode hexadecimal string to michelson bytes format', () => {
      expect(
        token.Encode(['0x000160cafa8127c423dc44a3acad6873ad9bd7ad7720eb8f999b35a4c2595ed0b891e6'])
      ).toEqual({
        bytes: '000160cafa8127c423dc44a3acad6873ad9bd7ad7720eb8f999b35a4c2595ed0b891e6',
      });
      expect(
        token.Encode(['000160cafa8127c423dc44a3acad6873ad9bd7ad7720eb8f999b35a4c2595ed0b891e6'])
      ).toEqual({
        bytes: '000160cafa8127c423dc44a3acad6873ad9bd7ad7720eb8f999b35a4c2595ed0b891e6',
      });
      expect(
        token.Encode([
          '0x00000160ae32b4dcd587afa223b7c667dd4813c00ac7cadcaa821186b7cbde1407183f6d154ebfdc829d3c08641beea7a8db37613060965efe0ace247e3a5e394c475b9c305263dd1f8ddb117b33c1e578ab5977763be88c157430fd59bf84707808385c9633be1a68f54c3566dd2b8e2307cf1d517a0ed70395eb72d57254fc6dc38d2d1ebfd468a236ea766dbab27c171cf609b09a84e54122575439b3b418c649bc8e09c52c52b4191e3151944e630e961f795f85cff5af4bdd95a20588fa16cdc6ea1341346be9fc8a055756d68e23443d2b617d89ae469da113a5e9d469efbb0a822b7a2d61de79b1e5d1f6d9b3079978328ca64e4c3789da124db2dc4450651bc4f6b63e474bbb90f37affb236095d8a47423aff108df7e513b27cde33a1338d16f92a3c10169f4dd7899815877d9a911312c8777a8bd9b2a116b71ae087fce90a1451fbf24f7f221a881d1d410e9307b7ec629a7b2ba9ff2ce2466987a2519d06000003e66b205d884a45a84df0fcdc07b3dbb27df306b3d6313dc4d67a2828fd7ff64c22b4b09813814ccb95d83d3f246a4f87c0752e85ea9ff2bd9b0049273b27ac53a6bb977b9d13deff268943867db112c08686749e20c2df36fcddc00e71c86f09fc29c6e9a65f1658ba741cff72609dc9c46e3e522b0c815b146c02bcea38f7bfa006478f041bbbcb9f39007087238a9fe219cd17df3238661988c89d3e4a03f4382807c216581454b7f411ad94cf49ba288146c781193b2b4f3004e949493945fe84e09cbd3c6e2179e9a2872cf739dcaad606f030e86b58f06a9ca2cc57627b11fe4d86613b578b16ad59c6b1b6611b4d968e365f64d1a455ae982ffb78d72ea25b7b0fa0ebd85dbf2be3b286b1353c6a80d0cbf8287ebff68082f716fd29f6050000004fd710f26136caf5150da4f874b3b62cbc8e722dd787d371536d1045bcbc85d6df8417e36b241a987d16b90ac5f71c7a3fd6d9ce4b50e5749087664a0a1c2060c37601023c3226d3170d3aa268fa45d8827c1fab06116a5859a49972d83cc945a30990b1efdc8c32d99afc56a64520a32c5839f7b3371a5e683cd53d794383041b6d0c7034c6c2b9df76070d3c8569ef072a013ca502c18be7c06bb043e6566cec87c062ee285fdf562b24dcf97dbde33557199090912c6575cc6735368ff5ac544f7e9922c9572fffc30adbc85ce24080e2c09a5db8002677a38c607f5ee070f77f8038fccddd6b193a37f5b8f11d0db8b60e67ded109d85cc0ae5ca63d56847463705cf941a758c7b1bdbb58869edd5dc357822cdf2d5bc1b61847e1df6557825a4347d1a57ab153d34f33702a719a2b937db28b8ea2b69ffbd8ddd00e9c90136c707c6c1dcfe3fca00aed153b06da0f4cedfbf122463f338fe09612f4f4d6fa92ba27dceb1f61c2c89cfeb12a695cf8f44633bec88a064f9a07a52ebe49fd848ae387ae3dcd853dff2618f2e4a693c7bea5fc3237cec347d2a0b481491e68b795c61428f91efcac6166901583953483291b06f2e37211fe1c4f59adcde711a4d572643b429add555ab6a9da097e3e9d7409b3b5b32f486b447463d8e765343fef8ed8534b700cf797cb4f9e0c799f0000004f49c7d25d1205f405451b200f8e6d2a882a4afd041d39ec3037794586737cbe1e17915add258aaff3b4b56a6d05403d6dd715c9cf50c285319f8a44bfe26f39a7ec4f81bbfafd8020b5e95b4b9c2d1730a612a4ce28151ea7a155449300d731474c9f2790a94c3d4e578c325ce0c3d7305109c40b1fc1142e29f42c083aba2fc43fe9f0d69497a253178233002c3665cb4d2e4d9390f13fbb45ce5d97daf27d3b34c123498a3f20e4571eed93e6f9cc90bdfc35f73abe103f3f4b9762a5e1a9aaf2343828abde4df66acc8b485d5e89cffef6f7b468f4ac34922ad5a6c385dcead704a6c9ddf6b4255c3c315b61381dea44b14a55ac9d290e2266b85c585a23ab350eae716fc73454f2f78c9855490d0000000000000000fa5b8c2dae7e5778f3c531ed423b381b1a96b866523ace35d1c2b22d67a23933',
        ])
      ).toEqual({
        bytes:
          '00000160ae32b4dcd587afa223b7c667dd4813c00ac7cadcaa821186b7cbde1407183f6d154ebfdc829d3c08641beea7a8db37613060965efe0ace247e3a5e394c475b9c305263dd1f8ddb117b33c1e578ab5977763be88c157430fd59bf84707808385c9633be1a68f54c3566dd2b8e2307cf1d517a0ed70395eb72d57254fc6dc38d2d1ebfd468a236ea766dbab27c171cf609b09a84e54122575439b3b418c649bc8e09c52c52b4191e3151944e630e961f795f85cff5af4bdd95a20588fa16cdc6ea1341346be9fc8a055756d68e23443d2b617d89ae469da113a5e9d469efbb0a822b7a2d61de79b1e5d1f6d9b3079978328ca64e4c3789da124db2dc4450651bc4f6b63e474bbb90f37affb236095d8a47423aff108df7e513b27cde33a1338d16f92a3c10169f4dd7899815877d9a911312c8777a8bd9b2a116b71ae087fce90a1451fbf24f7f221a881d1d410e9307b7ec629a7b2ba9ff2ce2466987a2519d06000003e66b205d884a45a84df0fcdc07b3dbb27df306b3d6313dc4d67a2828fd7ff64c22b4b09813814ccb95d83d3f246a4f87c0752e85ea9ff2bd9b0049273b27ac53a6bb977b9d13deff268943867db112c08686749e20c2df36fcddc00e71c86f09fc29c6e9a65f1658ba741cff72609dc9c46e3e522b0c815b146c02bcea38f7bfa006478f041bbbcb9f39007087238a9fe219cd17df3238661988c89d3e4a03f4382807c216581454b7f411ad94cf49ba288146c781193b2b4f3004e949493945fe84e09cbd3c6e2179e9a2872cf739dcaad606f030e86b58f06a9ca2cc57627b11fe4d86613b578b16ad59c6b1b6611b4d968e365f64d1a455ae982ffb78d72ea25b7b0fa0ebd85dbf2be3b286b1353c6a80d0cbf8287ebff68082f716fd29f6050000004fd710f26136caf5150da4f874b3b62cbc8e722dd787d371536d1045bcbc85d6df8417e36b241a987d16b90ac5f71c7a3fd6d9ce4b50e5749087664a0a1c2060c37601023c3226d3170d3aa268fa45d8827c1fab06116a5859a49972d83cc945a30990b1efdc8c32d99afc56a64520a32c5839f7b3371a5e683cd53d794383041b6d0c7034c6c2b9df76070d3c8569ef072a013ca502c18be7c06bb043e6566cec87c062ee285fdf562b24dcf97dbde33557199090912c6575cc6735368ff5ac544f7e9922c9572fffc30adbc85ce24080e2c09a5db8002677a38c607f5ee070f77f8038fccddd6b193a37f5b8f11d0db8b60e67ded109d85cc0ae5ca63d56847463705cf941a758c7b1bdbb58869edd5dc357822cdf2d5bc1b61847e1df6557825a4347d1a57ab153d34f33702a719a2b937db28b8ea2b69ffbd8ddd00e9c90136c707c6c1dcfe3fca00aed153b06da0f4cedfbf122463f338fe09612f4f4d6fa92ba27dceb1f61c2c89cfeb12a695cf8f44633bec88a064f9a07a52ebe49fd848ae387ae3dcd853dff2618f2e4a693c7bea5fc3237cec347d2a0b481491e68b795c61428f91efcac6166901583953483291b06f2e37211fe1c4f59adcde711a4d572643b429add555ab6a9da097e3e9d7409b3b5b32f486b447463d8e765343fef8ed8534b700cf797cb4f9e0c799f0000004f49c7d25d1205f405451b200f8e6d2a882a4afd041d39ec3037794586737cbe1e17915add258aaff3b4b56a6d05403d6dd715c9cf50c285319f8a44bfe26f39a7ec4f81bbfafd8020b5e95b4b9c2d1730a612a4ce28151ea7a155449300d731474c9f2790a94c3d4e578c325ce0c3d7305109c40b1fc1142e29f42c083aba2fc43fe9f0d69497a253178233002c3665cb4d2e4d9390f13fbb45ce5d97daf27d3b34c123498a3f20e4571eed93e6f9cc90bdfc35f73abe103f3f4b9762a5e1a9aaf2343828abde4df66acc8b485d5e89cffef6f7b468f4ac34922ad5a6c385dcead704a6c9ddf6b4255c3c315b61381dea44b14a55ac9d290e2266b85c585a23ab350eae716fc73454f2f78c9855490d0000000000000000fa5b8c2dae7e5778f3c531ed423b381b1a96b866523ace35d1c2b22d67a23933',
      });
      const uint8 = new Uint8Array([21, 31]);
      expect(token.Encode([uint8])).toEqual({
        bytes: '151f',
      });
    });

    it('Should throw a validation error when value is not valid bytes', () => {
      expect(() => token.Encode(['1'])).toThrowError(SaplingTransactionDeprecatedValidationError);
      expect(() => token.Encode(['test'])).toThrowError(
        SaplingTransactionDeprecatedValidationError
      );
    });
  });

  describe('Execute', () => {
    it('Should throw an error if the Execute method is call for sapling transaction deprecated token', () => {
      expect(() => token.Execute('')).toThrow(
        'There is no literal value for the sapling_transaction_deprecated type.'
      );
    });
  });

  describe('ExtractSchema', () => {
    it('Should extract schema', () => {
      expect(token.ExtractSchema()).toEqual({
        sapling_transaction_deprecated: { 'memo-size': 8 },
      });

      expect(token.generateSchema()).toEqual({
        __michelsonType: 'sapling_transaction_deprecated',
        schema: {
          memoSize: '8',
        },
      });
    });
  });
});
