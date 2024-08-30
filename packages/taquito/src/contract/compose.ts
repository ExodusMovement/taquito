import { Wallet } from '../wallet/wallet.js';
import { Context } from '../context.js';
import { ContractAbstraction } from './contract.js';
import { ContractProvider } from './interface.js';

export function compose<
    ContractAbsComposer1 extends ContractAbstraction<ContractProvider | Wallet>,
    ContractAbsComposer2 extends ContractAbstraction<ContractProvider | Wallet>,
    ContractAbstractionComposed
>(
    functioncomposer1: (abs: ContractAbsComposer1, context: Context) => ContractAbsComposer2,
    functioncomposer2: (abs: ContractAbsComposer2, context: Context) => ContractAbstractionComposed
): (abs: ContractAbsComposer1, context: Context) => ContractAbstractionComposed {
    return (contractAbstraction, context) =>
        functioncomposer2(functioncomposer1(contractAbstraction, context), context);
}
