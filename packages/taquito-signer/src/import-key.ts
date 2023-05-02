/**
 *
 * @description Import a key to sign operation with the side-effect of setting the Tezos instance to use the InMemorySigner provider
 *
 * @warn The JSON faucets are no longer available on https://teztnets.xyz/
 * @param toolkit The toolkit instance to attach a signer
 * @param privateKeyOrEmail Key to load in memory
 * @param passphrase If the key is encrypted passphrase to decrypt it
 * @param mnemonic Faucet mnemonic
 * @param secret Faucet secret
 */
export async function importKey(
  _toolkit: any,
  _privateKeyOrEmail: string,
  _passphrase?: string,
  _mnemonic?: string,
  _secret?: string
) {
  throw new Error('disabled on exodus fork')
}
