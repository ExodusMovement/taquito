# Taquito TZIP-012 package
*Documentation can be found [here](https://tezostaquito.io/docs/tzip12)*  
*TypeDoc style documentation is available on-line [here](https://tezostaquito.io/typedoc/modules/_taquito_tzip12.html)*

`@exodus/taquito-tzip12` is an npm package that provides developers with TZIP-12 functionality for Taquito. The package allows retrieving metadata associated with tokens of FA2 contracts.

## General Information

There are two scenarios to obtain the metadata of a token:
1. The metadata can be obtained from executing an off-chain view named `token_metadata` present in the contract metadata
2. or from a big map named `token_metadata` in the contract storage. 

The `getTokenMetadata` method of the `Tzip12ContractAbstraction` class will find the token metadata with precedence for the off-chain view, if there is one, as specified in the standard. Please refer to the following link for complete documentation on [TZIP-012#Token Metadata](https://gitlab.com/tezos/tzip/-/blob/master/proposals/tzip-12/tzip-12.md#token-metadata).

## Install

The package can be used to extend the well-known Taquito contract abstraction. The `@exodus/taquito-tzip12` and the `@exodus/taquito-taquito` packages need to be installed as follows:
```
npm i --save @exodus/taquito-tzip12
npm i --save @exodus/taquito-taquito
```

## Usage

**Create an instance of the `Tzip12Module` and add it as an extension to the `TezosToolkit`**

The constructor of the `Tzip12Module` takes an optional `MetadataProvider` as a parameter. When none is passed, the default `MetadataProvider` of Taquito is instantiated, and the default handlers (`HttpHandler,` `IpfsHandler,` and `TezosStorageHandler`) are used. The `MetadataProvider` can be customized by the user if needed.

**Use the `tzip12` function to extend a contract abstraction**

```ts
import { TezosToolkit } from '@exodus/taquito-taquito';
import { Tzip12Module } from '@exodus/taquito-tzip12';
import { tzip12 } from '@exodus/taquito-tzip12';

const Tezos = new TezosToolkit('https://YOUR_PREFERRED_RPC_URL');
Tezos.addExtension(new Tzip12Module());

const contract = await Tezos.contract.at("contractAddress", tzip12)

// get the token metadata
await contract.tzip12().getTokenMetadata(1);
```

The `getTokenMetadata` method takes a number as a parameter that represents the token_id and returns an object matching this interface:
```
interface TokenMetadata {
    token_id: number,
    decimals: number
    name?: string,
    symbol?: string,
}
```

## Additional info

See the top-level [https://github.com/ecadlabs/taquito](https://github.com/ecadlabs/taquito) file for details on reporting issues, contributing and versioning.

## Disclaimer

THIS SOFTWARE IS PROVIDED "AS IS" AND ANY EXPRESSED OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.