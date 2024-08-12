import { ContractAbi } from "@partisiablockchain/abi-client";
import { ShardedClient } from "./client/ShardedClient";
import { TransactionApi } from "./client/TransactionApi";
import { ConnectedWallet } from "./types/ConnectedWallet";
import { PetitionApi } from "./contract/PetitionApi";
import { updateContractState } from "./WalletIntegration";

export const CLIENT = new ShardedClient("https://node1.testnet.partisiablockchain.com", [
  "Shard0",
  "Shard1",
  "Shard2",
]);

let contractAddress: string | undefined;
let currentAccount: ConnectedWallet | undefined;
let contractAbi: ContractAbi | undefined;
let petitionApi: PetitionApi | undefined;

export const setAccount = (account: ConnectedWallet | undefined) => {
  currentAccount = account;
  setPetitionApi(account);
};

export const resetAccount = () => {
  currentAccount = undefined;
};

export const isConnected = () => {
  return currentAccount != null && contractAddress != null;
};

export const setContractAbi = (abi: ContractAbi) => {
  contractAbi = abi;
  // setPetitionApi();
};

export const getContractAbi = () => {
  return contractAbi;
};

export const setPetitionApi = (acc:any) => {
    const transactionApi = new TransactionApi(acc, updateContractState);
    petitionApi = new PetitionApi(transactionApi);
};

export const getPetitionApi = () => {
  return petitionApi;
};

export const getContractAddress = () => {
  return contractAddress;
};

export const setContractAddress = (address: string) => {
  contractAddress = address;
};
