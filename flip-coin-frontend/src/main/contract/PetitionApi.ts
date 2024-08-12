import { TransactionApi } from "../client/TransactionApi";
import { sign } from "./PetitionGenerated";
import { getContractAddress } from "../AppState";

export class PetitionApi {
  private readonly transactionApi: TransactionApi;

  constructor(transactionApi: TransactionApi) {
    this.transactionApi = transactionApi;
  }

  /**
   * Build and send sign transaction.
   */
  readonly sign = () => {
    const address = getContractAddress();
    if (address === undefined) {
      throw new Error("No address provided");
    }
    // First build the RPC buffer that is the payload of the transaction.
    const rpc = sign();
    // Then send the payload via the transaction API.
    return this.transactionApi.sendTransactionAndWait(address, rpc, 10_000);
  };
}
