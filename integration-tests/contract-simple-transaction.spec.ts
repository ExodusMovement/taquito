import { CONFIGS } from './config';

CONFIGS().forEach(({ lib, rpc, setup }) => {
  const Tezos = lib;

  describe(`Test simple transaction to tezos public key hashes: ${rpc}`, () => {
    beforeEach(
async () => {
      await setup(true);
  
    });

    it('should be able to send to a tz4 address', 
async () => {
      const op = await Tezos.contract.transfer({
        amount: 1,
        to: 'tz4HQ8VeXAyrZMhES1qLMJAc9uAVXjbMpS8u'
      });

      await op.confirmation();

      expect(op.status).toEqual('applied');
  
    });
  });
});
