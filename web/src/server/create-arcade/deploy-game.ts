'use server';

import { addRandomnessToFlip, deployContractV1, deployContractV3, flipCoin, payoutWinner, startGameAndPlaceBet } from '@/contracts_gen/clients/zk';
import {
  initialize,
  GameSettings as ContractGameSettings,
  GameSettingsD,
} from '@/contracts_gen/clients/gamemaster';
import { BN } from '@secata-public/bitmanipulation-ts';
import fs from 'fs';
import { getPendingGameSettings } from './get-pending-game-settings';
import { ChainAction } from '../chain-actions/types';
import { payloadToChainAction } from '../partisia.client';
import { BaseActions } from '@/lib/game-actions/base-actions';

const gamemasterContract = fs.readFileSync(
  process.cwd() + '/src/contracts_gen/gamemaster/flip_coin.zkwa',
);

const gamemasterAbi = fs.readFileSync(
  process.cwd() + '/src/contracts_gen/gamemaster/flip_coin.abi',
);

const MPC_DECIMALS = 4;
const MPC_DECIMALS_MULTIPLIER = 10 ** MPC_DECIMALS;

const GAS_DEPLOYMENT_COST = 100000;
const MPC_REQUIRED_STAKES = 20;

export const deployGame = async (
  account: string,
  contract: string,
  cost:number,
  choice:number|undefined
): Promise<ChainAction> => {
  if(choice == undefined) return Promise.reject('Choice is required');
  const gameMasterInit = getGameMasterInit(account);
  const deployment = startGameAndPlaceBet(
    gamemasterContract,
    gameMasterInit,
    gamemasterAbi,
    cost,
    choice
  );
  return payloadToChainAction(account, contract, deployment, {
    cost: GAS_DEPLOYMENT_COST,
  });
};


export const flipCoinRandomGame = async (
  account: string,
  contract: string,
): Promise<ChainAction> => {
  const gameMasterInit = getGameMasterInit(account);
  const deployment = addRandomnessToFlip(
    gamemasterContract,
    gameMasterInit,
    gamemasterAbi
  );
  return payloadToChainAction(account, contract, deployment, {
    cost: GAS_DEPLOYMENT_COST,
  });
};


export const flipCoinGame = async (
  account: string,
  contract: string,
): Promise<ChainAction> => {
  const gameMasterInit = getGameMasterInit(account);
  const deployment = flipCoin(
    gamemasterContract,
    gameMasterInit,
    gamemasterAbi
  );
  return payloadToChainAction(account, contract, deployment, {
    cost: GAS_DEPLOYMENT_COST*2,
  });
};


export const payoutWinnerGame = async (
  account: string,
  contract: string,
): Promise<ChainAction> => {
  const gameMasterInit = getGameMasterInit(account);
  const deployment = payoutWinner(
    gamemasterContract,
    gameMasterInit,
    gamemasterAbi
  );
  return payloadToChainAction(account, contract, deployment, {
    cost: GAS_DEPLOYMENT_COST,
  });
};

const getGameMasterInit = (address:string): Buffer => {
  const settings = getPendingGameSettings();
  const contractSettings = settings.map<ContractGameSettings>((setting:any) => {
    if (setting.gameType === 'flip-coin') {
      return {
        discriminant: GameSettingsD.GuessTheNumberGame,
        winnerPoint: setting.winPoints,
      };
    }
    throw new Error('Unknown game type');
  });
  return initialize(contractSettings,address);
};

