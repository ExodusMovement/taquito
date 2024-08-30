import { TransactionOperation } from '../../operations/transaction-operation.js';
import { TransferParams } from '../../operations/types.js';
import { TransactionWalletOperation } from '../../wallet/index.js';

export interface SendParams {
    fee?: number;
    storageLimit?: number;
    gasLimit?: number;
    amount: number;
    source?: string;
    mutez?: boolean;
}

// Ensure that all parameter that are not in SendParams are defined
export type ExplicitTransferParams = Required<Omit<TransferParams, keyof SendParams>> & SendParams;

export interface ContractMethodInterface {

    /**
     *
     * @description Send the smart contract operation
     *
     * @param Options generic operation parameter
     */
    send(params: Partial<SendParams>): Promise<TransactionWalletOperation | TransactionOperation>;

    /**
     *
     * @description Create transfer params to be used with TezosToolkit.contract.transfer methods
     *
     * @param Options generic transfer operation parameters
     */
    toTransferParams(params: Partial<SendParams>): TransferParams;
}