import { PairToken } from './pair.js';

import { NatToken } from './comparable/nat.js';

import { StringToken } from './comparable/string.js';

import { BigMapToken } from './bigmap.js';

import { AddressToken } from './comparable/address.js';

import { MapToken } from './map.js';

import { BoolToken } from './comparable/bool.js';

import { TxRollupL2AddressToken } from './comparable/tx_rollup_l2_address.js';

import { OrToken } from './or.js';

import { ContractToken } from './contract.js';

import { ListToken } from './list.js';
import { MutezToken } from './comparable/mutez.js';
import { BytesToken } from './comparable/bytes.js';
import { OptionToken } from './option.js';
import { TimestampToken } from './comparable/timestamp.js';
import { IntToken } from './comparable/int.js';
import { UnitToken } from './unit.js';
import { KeyToken } from './key.js';
import { KeyHashToken } from './comparable/key_hash.js';
import { SignatureToken } from './signature.js';
import { LambdaToken } from './lambda.js';
import { OperationToken } from './operation.js';
import { SetToken } from './set.js';
import { ChainIDToken } from './chain-id.js';
import { TicketToken } from './ticket.js';
import { TicketDeprecatedToken } from './ticket-deprecated.js';
import { NeverToken } from './never.js';
import { SaplingStateToken } from './sapling-state.js';
import { SaplingTransactionToken } from './sapling-transaction.js';
import { SaplingTransactionDeprecatedToken } from './sapling-transaction-deprecated.js';
import { Bls12381frToken } from './bls12-381-fr.js';
import { Bls12381g1Token } from './bls12-381-g1.js';
import { Bls12381g2Token } from './bls12-381-g2.js';
import { ChestToken } from './chest.js';
import { ChestKeyToken } from './chest-key.js';
import { GlobalConstantToken } from './constant.js';

export const tokens = [
  PairToken,
  NatToken,
  StringToken,
  BigMapToken,
  AddressToken,
  TxRollupL2AddressToken,
  MapToken,
  BoolToken,
  OrToken,
  ContractToken,
  ListToken,
  MutezToken,
  BytesToken,
  OptionToken,
  TimestampToken,
  IntToken,
  UnitToken,
  KeyToken,
  KeyHashToken,
  SignatureToken,
  LambdaToken,
  OperationToken,
  SetToken,
  ChainIDToken,
  TicketToken,
  TicketDeprecatedToken,
  NeverToken,
  SaplingStateToken,
  SaplingTransactionToken,
  SaplingTransactionDeprecatedToken,
  Bls12381frToken,
  Bls12381g1Token,
  Bls12381g2Token,
  ChestToken,
  ChestKeyToken,
  GlobalConstantToken,
];
