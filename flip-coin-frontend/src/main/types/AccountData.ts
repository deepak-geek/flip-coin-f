/**
 * Interface to specify some values of a PBC account.
 * The nonce is needed when building transactions.
 */
export interface AccountData {
  address: string;
  nonce: number;
}
