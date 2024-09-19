import BN from "bn.js";
import {
  AbiParser,
  AbstractBuilder, BigEndianReader,
  FileAbi, FnKinds, FnRpcBuilder, RpcReader,
  ScValue,
  ScValueEnum, ScValueOption,
  ScValueStruct,
  StateReader, TypeIndex,
  StateBytes,
  BlockchainAddress
} from "@partisiablockchain/abi-client";
import {BigEndianByteOutput} from "@secata-public/bitmanipulation-ts";

const fileAbi: FileAbi = new AbiParser(Buffer.from(
  "5042434142490b02000505000000000d020000000c506c6179657243686f69636500000002000001010002010000000548656164730000000001000000055461696c7300000000010000001252616e646f6d436f6e747269627574696f6e0000000100000006726573756c7406020000000947616d6550686173650000000400000501000602000703000801000000055374617274000000000100000009506c61636542657473000000000100000008466c6970436f696e000000000100000004446f6e6500000000010000000d436f696e466c697053746174650000000800000006706c61796572120d0000000a706c617965725f62657412040000000d706c617965725f63686f6963651200000000000e666c69705f726573756c745f696412000a0000000b666c69705f726573756c74120c0000000677696e6e6572120d0000000d757365725f62616c616e6365730f0d040000000a67616d655f70686173650004010000000b536563726574566172496400000001000000067261775f69640301000000134576656e74537562736372697074696f6e496400000001000000067261775f696408010000000f45787465726e616c4576656e74496400000001000000067261775f69640800000008010000000a696e697469616c697a65ffffffff0f0000000100000006706c617965720d020000001873746172745f67616d655f616e645f706c6163655f62657401000000020000000a6265745f616d6f756e74040000000663686f696365000017000000166164645f72616e646f6d6e6573735f746f5f666c697040000000000000000c7365637265745f696e70757400031100000011696e7075747465645f7661726961626c6501000000000200000009666c69705f636f696e03000000001300000015666c69705f636f6d707574655f636f6d706c657465010000000014000000196f70656e5f666c69705f726573756c745f7661726961626c658fa1f8a30c00000000020000000d7061796f75745f77696e6e657204000000000009",
  "hex"
)).parseAbi();

type Option<K> = K | undefined;

export type GameSettings = GameSettingsGuessTheNumberGame;

export enum GameSettingsD {
  GuessTheNumberGame = 0,
}

function buildRpcGameSettings(val: GameSettings, builder: AbstractBuilder) {
  if (val.discriminant === GameSettingsD.GuessTheNumberGame) {
    buildRpcGameSettingsGuessTheNumberGame(val, builder);
  }
}

function fromScValueGameSettings(enumValue: ScValueEnum): GameSettings {
  const item = enumValue.item;
  if (item.name === "GuessTheNumberGame") {
    return fromScValueGameSettingsGuessTheNumberGame(item);
  }
  throw Error("Should not happen");
}

export interface GameSettingsGuessTheNumberGame {
  discriminant: GameSettingsD.GuessTheNumberGame;
  winnerPoint: number;
}

export function newGameSettingsGuessTheNumberGame(winnerPoint: number): GameSettingsGuessTheNumberGame {
  return {discriminant: 0, winnerPoint, };
}

function buildRpcGameSettingsGuessTheNumberGame(value: GameSettingsGuessTheNumberGame, builder: AbstractBuilder) {
  const enumVariantBuilder = builder.addEnumVariant(GameSettingsD.GuessTheNumberGame);
  enumVariantBuilder.addU32(value.winnerPoint);
}

function fromScValueGameSettingsGuessTheNumberGame(structValue: ScValueStruct): GameSettingsGuessTheNumberGame {
  return {
    discriminant: GameSettingsD.GuessTheNumberGame,
    winnerPoint: structValue.getFieldValue("winner_point")!.asNumber(),
  };
}

export interface PlayerOutcome {
  sabotage: boolean;
  protect: boolean;
}

export function newPlayerOutcome(sabotage: boolean, protect: boolean): PlayerOutcome {
  return {sabotage, protect};
}

function fromScValuePlayerOutcome(structValue: ScValueStruct): PlayerOutcome {
  return {
    sabotage: structValue.getFieldValue("sabotage")!.boolValue(),
    protect: structValue.getFieldValue("protect")!.boolValue(),
  };
}

export type SplitDecision = 
  | SplitDecisionNoAction
  | SplitDecisionSplit
  | SplitDecisionConquer;

export enum SplitDecisionD {
  NoAction = 0,
  Split = 1,
  Conquer = 2
}

function fromScValueSplitDecision(enumValue: ScValueEnum): SplitDecision {
  const item = enumValue.item;
  if (item.name === "NoAction") {
    return fromScValueSplitDecisionNoAction(item);
  }
  if (item.name === "Split") {
    return fromScValueSplitDecisionSplit(item);
  }
  if (item.name === "Conquer") {
    return fromScValueSplitDecisionConquer(item);
  }
  throw Error("Should not happen");
}

export interface SplitDecisionNoAction {
  discriminant: SplitDecisionD.NoAction;
}

export function newSplitDecisionNoAction(): SplitDecisionNoAction {
  return {discriminant: 0, };
}

function fromScValueSplitDecisionNoAction(structValue: ScValueStruct): SplitDecisionNoAction {
  return {
    discriminant: SplitDecisionD.NoAction,
  };
}

export interface SplitDecisionSplit {
  discriminant: SplitDecisionD.Split;
}

export function newSplitDecisionSplit(): SplitDecisionSplit {
  return {discriminant: 1, };
}

function fromScValueSplitDecisionSplit(structValue: ScValueStruct): SplitDecisionSplit {
  return {
    discriminant: SplitDecisionD.Split,
  };
}

export interface SplitDecisionConquer {
  discriminant: SplitDecisionD.Conquer;
}

export function newSplitDecisionConquer(): SplitDecisionConquer {
  return {discriminant: 2, };
}

function fromScValueSplitDecisionConquer(structValue: ScValueStruct): SplitDecisionConquer {
  return {
    discriminant: SplitDecisionD.Conquer,
  };
}

export interface SplitOrConquerPlayerDecision {
  playerIndex: number;
  split: SplitDecision;
}

export function newSplitOrConquerPlayerDecision(playerIndex: number, split: SplitDecision): SplitOrConquerPlayerDecision {
  return {playerIndex, split};
}

function fromScValueSplitOrConquerPlayerDecision(structValue: ScValueStruct): SplitOrConquerPlayerDecision {
  return {
    playerIndex: structValue.getFieldValue("player_index")!.asNumber(),
    split: fromScValueSplitDecision(structValue.getFieldValue("split")!.enumValue()),
  };
}

export interface SplitOrConquerOutcome {
  playerA: SplitOrConquerPlayerDecision;
  playerB: SplitOrConquerPlayerDecision;
}

export function newSplitOrConquerOutcome(playerA: SplitOrConquerPlayerDecision, playerB: SplitOrConquerPlayerDecision): SplitOrConquerOutcome {
  return {playerA, playerB};
}

function fromScValueSplitOrConquerOutcome(structValue: ScValueStruct): SplitOrConquerOutcome {
  return {
    playerA: fromScValueSplitOrConquerPlayerDecision(structValue.getFieldValue("player_a")!.structValue()),
    playerB: fromScValueSplitOrConquerPlayerDecision(structValue.getFieldValue("player_b")!.structValue()),
  };
}

export type Game = 
  | GameGuessTheNumber
  | GameSabotage
  | GameSplitOrConquer;

export enum GameD {
  GuessTheNumber = 0,
  Sabotage = 1,
  SplitOrConquer = 2
}

function fromScValueGame(enumValue: ScValueEnum): Game {
  const item = enumValue.item;
  if (item.name === "GuessTheNumber") {
    return fromScValueGameGuessTheNumber(item);
  }
  throw Error("Should not happen");
}

export interface GameGuessTheNumber {
  discriminant: GameD.GuessTheNumber;
  winnerPoint: number;
  wrongGuesses: Buffer;
  winner: Option<number>;
  readyToStart: boolean;
}

export function newGameGuessTheNumber(winnerPoint: number, wrongGuesses: Buffer, winner: Option<number>, readyToStart: boolean): GameGuessTheNumber {
  return {discriminant: 0, winnerPoint, wrongGuesses, winner, readyToStart, };
}

function fromScValueGameGuessTheNumber(structValue: ScValueStruct): GameGuessTheNumber {
  return {
    discriminant: GameD.GuessTheNumber,
    winnerPoint: structValue.getFieldValue("winner_point")!.asNumber(),
    wrongGuesses: structValue.getFieldValue("wrong_guesses")!.vecU8Value(),
    winner: structValue.getFieldValue("winner")!.optionValue().valueOrUndefined((sc1) => sc1.asNumber()),
    readyToStart: structValue.getFieldValue("ready_to_start")!.boolValue(),
  };
}

export interface GameSabotage {
  discriminant: GameD.Sabotage;
  sabotagePoint: number;
  protectPointCost: number;
  result: Option<PlayerOutcome[]>;
}

export function newGameSabotage(sabotagePoint: number, protectPointCost: number, result: Option<PlayerOutcome[]>): GameSabotage {
  return {discriminant: 1, sabotagePoint, protectPointCost, result, };
}

function fromScValueGameSabotage(structValue: ScValueStruct): GameSabotage {
  return {
    discriminant: GameD.Sabotage,
    sabotagePoint: structValue.getFieldValue("sabotage_point")!.asNumber(),
    protectPointCost: structValue.getFieldValue("protect_point_cost")!.asNumber(),
    result: structValue.getFieldValue("result")!.optionValue().valueOrUndefined((sc2) => sc2.vecValue().values().map((sc3) => fromScValuePlayerOutcome(sc3.structValue()))),
  };
}

export interface GameSplitOrConquer {
  discriminant: GameD.SplitOrConquer;
  splitPoints: number;
  result: Option<SplitOrConquerOutcome[]>;
}

export function newGameSplitOrConquer(splitPoints: number, result: Option<SplitOrConquerOutcome[]>): GameSplitOrConquer {
  return {discriminant: 2, splitPoints, result, };
}

function fromScValueGameSplitOrConquer(structValue: ScValueStruct): GameSplitOrConquer {
  return {
    discriminant: GameD.SplitOrConquer,
    splitPoints: structValue.getFieldValue("split_points")!.asNumber(),
    result: structValue.getFieldValue("result")!.optionValue().valueOrUndefined((sc4) => sc4.vecValue().values().map((sc5) => fromScValueSplitOrConquerOutcome(sc5.structValue()))),
  };
}

export type GameStatus = 
  | GameStatusNotStarted
  | GameStatusInProgress
  | GameStatusCalculating
  | GameStatusFinished;

export enum GameStatusD {
  NotStarted = 0,
  InProgress = 1,
  Calculating = 2,
  Finished = 3
}

function fromScValueGameStatus(enumValue: ScValueEnum): GameStatus {
  const item = enumValue.item;
  if (item.name === "NotStarted") {
    return fromScValueGameStatusNotStarted(item);
  }
  if (item.name === "InProgress") {
    return fromScValueGameStatusInProgress(item);
  }
  if (item.name === "Calculating") {
    return fromScValueGameStatusCalculating(item);
  }
  if (item.name === "Finished") {
    return fromScValueGameStatusFinished(item);
  }
  throw Error("Should not happen");
}

export interface GameStatusNotStarted {
  discriminant: GameStatusD.NotStarted;
}

export function newGameStatusNotStarted(): GameStatusNotStarted {
  return {discriminant: 0, };
}

function fromScValueGameStatusNotStarted(structValue: ScValueStruct): GameStatusNotStarted {
  return {
    discriminant: GameStatusD.NotStarted,
  };
}

export interface GameStatusInProgress {
  discriminant: GameStatusD.InProgress;
}

export function newGameStatusInProgress(): GameStatusInProgress {
  return {discriminant: 1, };
}

function fromScValueGameStatusInProgress(structValue: ScValueStruct): GameStatusInProgress {
  return {
    discriminant: GameStatusD.InProgress,
  };
}

export interface GameStatusCalculating {
  discriminant: GameStatusD.Calculating;
}

export function newGameStatusCalculating(): GameStatusCalculating {
  return {discriminant: 2, };
}

function fromScValueGameStatusCalculating(structValue: ScValueStruct): GameStatusCalculating {
  return {
    discriminant: GameStatusD.Calculating,
  };
}

export interface GameStatusFinished {
  discriminant: GameStatusD.Finished;
}

export function newGameStatusFinished(): GameStatusFinished {
  return {discriminant: 3, };
}

function fromScValueGameStatusFinished(structValue: ScValueStruct): GameStatusFinished {
  return {
    discriminant: GameStatusD.Finished,
  };
}

export interface CurrentGame {
  index: number;
  status: GameStatus;
}

export function newCurrentGame(index: number, status: GameStatus): CurrentGame {
  return {index, status};
}

function fromScValueCurrentGame(structValue: ScValueStruct): CurrentGame {
  return {
    index: structValue.getFieldValue("index")!.asNumber(),
    status: fromScValueGameStatus(structValue.getFieldValue("status")!.enumValue()),
  };
}

export interface ContractState {
  administrator: BlockchainAddress;
  players: BlockchainAddress[];
  currentGame: CurrentGame;
  games: Game[];
  points: number[][];
}

export function newContractState(administrator: BlockchainAddress, players: BlockchainAddress[], currentGame: CurrentGame, games: Game[], points: number[][]): ContractState {
  return {administrator, players, currentGame, games, points};
}

function fromScValueContractState(structValue: ScValueStruct): ContractState {
  return {
    administrator: BlockchainAddress.fromBuffer(structValue.getFieldValue("administrator")!.addressValue().value),
    players: structValue.getFieldValue("players")!.vecValue().values().map((sc6) => BlockchainAddress.fromBuffer(sc6.addressValue().value)),
    currentGame: fromScValueCurrentGame(structValue.getFieldValue("current_game")!.structValue()),
    games: structValue.getFieldValue("games")!.vecValue().values().map((sc7) => fromScValueGame(sc7.enumValue())),
    points: structValue.getFieldValue("points")!.vecValue().values().map((sc8) => sc8.vecValue().values().map((sc9) => sc9.asNumber())),
  };
}

export function deserializeContractState(state: StateBytes): ContractState {
  const scValue = new StateReader(state.state, fileAbi.contract, state.avlTrees).readState();
  return fromScValueContractState(scValue);
}

export interface SecretVarId {
  rawId: number;
}

export function newSecretVarId(rawId: number): SecretVarId {
  return {rawId};
}

function fromScValueSecretVarId(structValue: ScValueStruct): SecretVarId {
  return {
    rawId: structValue.getFieldValue("raw_id")!.asNumber(),
  };
}

export interface EventSubscriptionId {
  rawId: number;
}

export function newEventSubscriptionId(rawId: number): EventSubscriptionId {
  return {rawId};
}

function fromScValueEventSubscriptionId(structValue: ScValueStruct): EventSubscriptionId {
  return {
    rawId: structValue.getFieldValue("raw_id")!.asNumber(),
  };
}

export interface ExternalEventId {
  rawId: number;
}

export function newExternalEventId(rawId: number): ExternalEventId {
  return {rawId};
}

function fromScValueExternalEventId(structValue: ScValueStruct): ExternalEventId {
  return {
    rawId: structValue.getFieldValue("raw_id")!.asNumber(),
  };
}

export function initialize(games: GameSettings[],address:string): Buffer {
  const fnBuilder = new FnRpcBuilder("initialize", fileAbi.contract);
  fnBuilder.addAddress(address);
  return fnBuilder.getBytes();
}

export function signUp(): Buffer {
  const fnBuilder = new FnRpcBuilder("sign_up", fileAbi.contract);
  return fnBuilder.getBytes();
}

export function nextGame(): Buffer {
  const fnBuilder = new FnRpcBuilder("next_game", fileAbi.contract);
  return fnBuilder.getBytes();
}

export function endGame(): Buffer {
  const fnBuilder = new FnRpcBuilder("end_game", fileAbi.contract);
  return fnBuilder.getBytes();
}

export function guess(guess: number): Buffer {
  const fnBuilder = new FnRpcBuilder("guess", fileAbi.contract);
  fnBuilder.addU8(guess);
  return fnBuilder.getBytes();
}

