'use server';

import {
  flipCoin,
  initialize,
  payoutWinner,
  PlayerChoice,
  startGameAndPlaceBet,
} from '@/contracts_gen/clients/flip-coin';
import {
  approve,
  transfer,
  initialize as initializeToken,
  transferFrom
} from '@/contracts_gen/clients/token';
import BN from "bn.js";
import fs from 'fs';
import { ChainAction } from '../chain-actions/types';
import { payloadToChainAction } from '../partisia.client';
import { BlockchainAddress } from '@partisiablockchain/abi-client';

const flipCoinContract = fs.readFileSync(
  process.cwd() + '/src/contracts_gen/gamemaster/flip_coin.zkwa',
);

const flipCoinAbi = fs.readFileSync(
  process.cwd() + '/src/contracts_gen/gamemaster/flip_coin.abi',
);

const MPC_DECIMALS = 4;
const MPC_DECIMALS_MULTIPLIER = 10 ** MPC_DECIMALS;

const GAS_DEPLOYMENT_COST = 100000;
const MPC_REQUIRED_STAKES = 20;

export const deployGame = async (
  account: string,
  contract: string,
  cost:BN,
  choice:PlayerChoice
): Promise<ChainAction> => {
  if(choice == undefined) return Promise.reject('Choice is required');
  const blockchainAddress= BlockchainAddress.fromString(account);
  getGameMasterInit(blockchainAddress);
  console.log(cost , choice)
  const deployment = startGameAndPlaceBet(
    cost,
    choice
  );
  return payloadToChainAction(account, contract, deployment, {
    cost: GAS_DEPLOYMENT_COST,
  });
};


export const flipCoinGame = async (
  account: string,
  contract: string,
): Promise<ChainAction> => {
  const deployment = flipCoin();
  return payloadToChainAction(account, contract, deployment, {
    cost: GAS_DEPLOYMENT_COST*2,
  });
};

export const flipCoinRandomGame = async (
  account: string,
  contract: string,
): Promise<ChainAction> => {
  const deployment = flipCoin();
  return payloadToChainAction(account, contract, deployment, {
    cost: GAS_DEPLOYMENT_COST*2,
  });
};


export const payoutWinnerGame = async (
  account: string,
  contract: string,
): Promise<ChainAction> => {
  const deployment = payoutWinner();
  return payloadToChainAction(account, contract, deployment, {
    cost: GAS_DEPLOYMENT_COST,
  });
};
export const payoutTransfer = async (
  contract: string,
  account: string,
  amount: number
): Promise<ChainAction> => {
  const bnAmount= new BN(amount);
  const blockchainAddress= BlockchainAddress.fromString(account);
  const fromBlockchainAddress= BlockchainAddress.fromString("00944a6e30da930df677f0db098f64bac1b33869ee");
  const deployment = transferFrom(fromBlockchainAddress,blockchainAddress,bnAmount);
  return payloadToChainAction(account, contract, deployment, {
    cost: GAS_DEPLOYMENT_COST,
  });
};

export const payoutApprove = async (
  contract: string,
  account: string,
  amount: number
): Promise<ChainAction> => {
  const bnAmount= new BN(amount);
  const blockchainAddress= BlockchainAddress.fromString(account);
  const deployment = approve(blockchainAddress,bnAmount);
  return payloadToChainAction(account, contract, deployment, {
    cost: GAS_DEPLOYMENT_COST,
  });
};

const getGameMasterInit = (address:BlockchainAddress): Buffer => {
  return initialize(address);
};

const getGameTokenInit = (address:BlockchainAddress): Buffer => {
  const supply= new BN(10);
  const blockchainAddress= BlockchainAddress.fromString('03818281bbf60e11c2e3c6172027e8b2b793df6d12');

  return initializeToken("flip","$",2,supply,0,20,2,10,blockchainAddress,blockchainAddress,address);
};

