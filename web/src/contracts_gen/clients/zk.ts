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
  BlockchainAddress,
  Hash,
  ZkInputBuilder
} from "@partisiablockchain/abi-client";
import {BigEndianByteOutput} from "@secata-public/bitmanipulation-ts";
import { ZkRpcBuilder } from "@partisiablockchain/zk-client";

const fileAbi: FileAbi = new AbiParser(Buffer.from(
  "5042434142490b02000505000000000d020000000c506c6179657243686f69636500000002000001010002010000000548656164730000000001000000055461696c7300000000010000001252616e646f6d436f6e747269627574696f6e0000000100000006726573756c7406020000000947616d6550686173650000000400000501000602000703000801000000055374617274000000000100000009506c61636542657473000000000100000008466c6970436f696e000000000100000004446f6e6500000000010000000d436f696e466c697053746174650000000800000006706c61796572120d0000000a706c617965725f62657412040000000d706c617965725f63686f6963651200000000000e666c69705f726573756c745f696412000a0000000b666c69705f726573756c74120c0000000677696e6e6572120d0000000d757365725f62616c616e6365730f0d040000000a67616d655f70686173650004010000000b536563726574566172496400000001000000067261775f69640301000000134576656e74537562736372697074696f6e496400000001000000067261775f696408010000000f45787465726e616c4576656e74496400000001000000067261775f69640800000008010000000a696e697469616c697a65ffffffff0f0000000100000006706c617965720d020000001873746172745f67616d655f616e645f706c6163655f62657401000000020000000a6265745f616d6f756e74040000000663686f696365000017000000166164645f72616e646f6d6e6573735f746f5f666c697040000000000000000c7365637265745f696e70757400031100000011696e7075747465645f7661726961626c6501000000000200000009666c69705f636f696e03000000001300000015666c69705f636f6d707574655f636f6d706c657465010000000014000000196f70656e5f666c69705f726573756c745f7661726961626c658fa1f8a30c00000000020000000d7061796f75745f77696e6e657204000000000009",
  "hex"
)).parseAbi();

type Option<K> = K | undefined;

export interface RealDeployContractState {
  binders: Option<Map<Option<number>, Option<BinderInfo>>>;
  nextBinderId: number;
  preProcess: Option<BlockchainAddress>;
  systemUpdateAddress: Option<BlockchainAddress>;
  zkNodeRegistry: Option<BlockchainAddress>;
}

export function newRealDeployContractState(binders: Option<Map<Option<number>, Option<BinderInfo>>>, nextBinderId: number, preProcess: Option<BlockchainAddress>, systemUpdateAddress: Option<BlockchainAddress>, zkNodeRegistry: Option<BlockchainAddress>): RealDeployContractState {
  return {binders, nextBinderId, preProcess, systemUpdateAddress, zkNodeRegistry};
}

function fromScValueRealDeployContractState(structValue: ScValueStruct): RealDeployContractState {
  return {
    binders: structValue.getFieldValue("binders")!.optionValue().valueOrUndefined((sc1) => new Map([...sc1.mapValue().map].map(([k2, v3]) => [k2.optionValue().valueOrUndefined((sc4) => sc4.asNumber()), v3.optionValue().valueOrUndefined((sc5) => fromScValueBinderInfo(sc5.structValue()))]))),
    nextBinderId: structValue.getFieldValue("nextBinderId")!.asNumber(),
    preProcess: structValue.getFieldValue("preProcess")!.optionValue().valueOrUndefined((sc6) => BlockchainAddress.fromBuffer(sc6.addressValue().value)),
    systemUpdateAddress: structValue.getFieldValue("systemUpdateAddress")!.optionValue().valueOrUndefined((sc7) => BlockchainAddress.fromBuffer(sc7.addressValue().value)),
    zkNodeRegistry: structValue.getFieldValue("zkNodeRegistry")!.optionValue().valueOrUndefined((sc8) => BlockchainAddress.fromBuffer(sc8.addressValue().value)),
  };
}

export function deserializeRealDeployContractState(state: StateBytes): RealDeployContractState {
  const scValue = new StateReader(state.state, fileAbi.contract, state.avlTrees).readState();
  return fromScValueRealDeployContractState(scValue);
}

export interface BinderInfo {
  bindingJar: Option<Buffer>;
  supportedZkbcVersionMax: Option<SemanticVersion$State>;
  usedProtocolVersion: Option<SemanticVersion$State>;
  versionInterval: Option<SupportedBinderVersionInterval>;
}

export function newBinderInfo(bindingJar: Option<Buffer>, supportedZkbcVersionMax: Option<SemanticVersion$State>, usedProtocolVersion: Option<SemanticVersion$State>, versionInterval: Option<SupportedBinderVersionInterval>): BinderInfo {
  return {bindingJar, supportedZkbcVersionMax, usedProtocolVersion, versionInterval};
}

function fromScValueBinderInfo(structValue: ScValueStruct): BinderInfo {
  return {
    bindingJar: structValue.getFieldValue("bindingJar")!.optionValue().valueOrUndefined((sc9) => sc9.vecU8Value()),
    supportedZkbcVersionMax: structValue.getFieldValue("supportedZkbcVersionMax")!.optionValue().valueOrUndefined((sc10) => fromScValueSemanticVersion$State(sc10.structValue())),
    usedProtocolVersion: structValue.getFieldValue("usedProtocolVersion")!.optionValue().valueOrUndefined((sc11) => fromScValueSemanticVersion$State(sc11.structValue())),
    versionInterval: structValue.getFieldValue("versionInterval")!.optionValue().valueOrUndefined((sc12) => fromScValueSupportedBinderVersionInterval(sc12.structValue())),
  };
}

export interface SupportedBinderVersionInterval {
  supportedBinderVersionMax: Option<SemanticVersion$State>;
  supportedBinderVersionMin: Option<SemanticVersion$State>;
}

export function newSupportedBinderVersionInterval(supportedBinderVersionMax: Option<SemanticVersion$State>, supportedBinderVersionMin: Option<SemanticVersion$State>): SupportedBinderVersionInterval {
  return {supportedBinderVersionMax, supportedBinderVersionMin};
}

function fromScValueSupportedBinderVersionInterval(structValue: ScValueStruct): SupportedBinderVersionInterval {
  return {
    supportedBinderVersionMax: structValue.getFieldValue("supportedBinderVersionMax")!.optionValue().valueOrUndefined((sc13) => fromScValueSemanticVersion$State(sc13.structValue())),
    supportedBinderVersionMin: structValue.getFieldValue("supportedBinderVersionMin")!.optionValue().valueOrUndefined((sc14) => fromScValueSemanticVersion$State(sc14.structValue())),
  };
}

export interface SemanticVersion$State {
  major: number;
  minor: number;
  patch: number;
}

export function newSemanticVersion$State(major: number, minor: number, patch: number): SemanticVersion$State {
  return {major, minor, patch};
}

function fromScValueSemanticVersion$State(structValue: ScValueStruct): SemanticVersion$State {
  return {
    major: structValue.getFieldValue("major")!.asNumber(),
    minor: structValue.getFieldValue("minor")!.asNumber(),
    patch: structValue.getFieldValue("patch")!.asNumber(),
  };
}

export interface SemanticVersion$Rpc {
  major: number;
  minor: number;
  patch: number;
}

export function newSemanticVersion$Rpc(major: number, minor: number, patch: number): SemanticVersion$Rpc {
  return {major, minor, patch};
}

function fromScValueSemanticVersion$Rpc(structValue: ScValueStruct): SemanticVersion$Rpc {
  return {
    major: structValue.getFieldValue("major")!.asNumber(),
    minor: structValue.getFieldValue("minor")!.asNumber(),
    patch: structValue.getFieldValue("patch")!.asNumber(),
  };
}

function buildRpcSemanticVersion$Rpc(value: SemanticVersion$Rpc, builder: AbstractBuilder) {
  const structBuilder = builder.addStruct();
  structBuilder.addI32(value.major);
  structBuilder.addI32(value.minor);
  structBuilder.addI32(value.patch);
}

export function create(bindingJar: Buffer, preProcess: BlockchainAddress, zkNodeRegistry: BlockchainAddress, systemUpdateAddress: BlockchainAddress, supportedProtocolVersion: SemanticVersion$Rpc, supportedBinderVersionMin: SemanticVersion$Rpc, supportedBinderVersionMax: SemanticVersion$Rpc, supportedZkbcVersionMax: SemanticVersion$Rpc): Buffer {
  const fnBuilder = new FnRpcBuilder("create", fileAbi.contract);
  fnBuilder.addVecU8(bindingJar);
  fnBuilder.addAddress(preProcess.asBuffer());
  fnBuilder.addAddress(zkNodeRegistry.asBuffer());
  fnBuilder.addAddress(systemUpdateAddress.asBuffer());
  buildRpcSemanticVersion$Rpc(supportedProtocolVersion, fnBuilder);
  buildRpcSemanticVersion$Rpc(supportedBinderVersionMin, fnBuilder);
  buildRpcSemanticVersion$Rpc(supportedBinderVersionMax, fnBuilder);
  buildRpcSemanticVersion$Rpc(supportedZkbcVersionMax, fnBuilder);
  return fnBuilder.getBytes();
}

export function deployContractV1(contractJar: Buffer, initialization: Buffer, abi: Buffer): Buffer {
  const fnBuilder = new FnRpcBuilder("deployContractV1", fileAbi.contract);
  fnBuilder.addVecU8(contractJar);
  fnBuilder.addVecU8(initialization);
  fnBuilder.addVecU8(abi);
  // fnBuilder.addI64(requiredStakes);
  return fnBuilder.getBytes();
}

export function deployContractV2(contractJar: Buffer, initialization: Buffer, abi: Buffer, requiredStakes: BN, allowedJurisdictions: number[][]): Buffer {
  const fnBuilder = new FnRpcBuilder("deployContractV2", fileAbi.contract);
  fnBuilder.addVecU8(contractJar);
  fnBuilder.addVecU8(initialization);
  fnBuilder.addVecU8(abi);
  fnBuilder.addI64(requiredStakes);
  const vecBuilder15 = fnBuilder.addVec();
  for (const vecEntry16 of allowedJurisdictions) {
    const vecBuilder17 = vecBuilder15.addVec();
    for (const vecEntry18 of vecEntry16) {
      vecBuilder17.addI32(vecEntry18);
    }
  }
  return fnBuilder.getBytes();
}

export function deployContractV3(contractJar: Buffer, initialization: Buffer, abi: Buffer, requiredStakes: BN, allowedJurisdictions: number[][], uniqueId: number): Buffer {
  const fnBuilder = new FnRpcBuilder("deployContractV3", fileAbi.contract);
  console.log("version", fnBuilder);
  fnBuilder.addVecU8(contractJar);
  fnBuilder.addVecU8(initialization);
  fnBuilder.addVecU8(abi);
  fnBuilder.addI64(requiredStakes);
  const vecBuilder19 = fnBuilder.addVec();
  for (const vecEntry20 of allowedJurisdictions) {
    const vecBuilder21 = vecBuilder19.addVec();
    for (const vecEntry22 of vecEntry20) {
      vecBuilder21.addI32(vecEntry22);
    }
  }
  fnBuilder.addI32(uniqueId);
  return fnBuilder.getBytes();
}

export function addBinder(bindingJar: Buffer, supportedBinderVersionMin: SemanticVersion$Rpc, supportedBinderVersionMax: SemanticVersion$Rpc, usedProtocolVersion: SemanticVersion$Rpc, supportedZkbcVersionMax: SemanticVersion$Rpc): Buffer {
  const fnBuilder = new FnRpcBuilder("addBinder", fileAbi.contract);
  fnBuilder.addVecU8(bindingJar);
  buildRpcSemanticVersion$Rpc(supportedBinderVersionMin, fnBuilder);
  buildRpcSemanticVersion$Rpc(supportedBinderVersionMax, fnBuilder);
  buildRpcSemanticVersion$Rpc(usedProtocolVersion, fnBuilder);
  buildRpcSemanticVersion$Rpc(supportedZkbcVersionMax, fnBuilder);
  return fnBuilder.getBytes();
}

export function removeBinder(binderId: number): Buffer {
  const fnBuilder = new FnRpcBuilder("removeBinder", fileAbi.contract);
  fnBuilder.addI32(binderId);
  return fnBuilder.getBytes();
}

export function deployContractV4(contractJar: Buffer, initialization: Buffer, abi: Buffer, requiredStakes: BN, allowedJurisdictions: number[][], uniqueId: number, requiredEvmChainSupport: string[]): Buffer {
  const fnBuilder = new FnRpcBuilder("deployContractV4", fileAbi.contract);
  fnBuilder.addVecU8(contractJar);
  fnBuilder.addVecU8(initialization);
  fnBuilder.addVecU8(abi);
  fnBuilder.addI64(requiredStakes);
  const vecBuilder23 = fnBuilder.addVec();
  for (const vecEntry24 of allowedJurisdictions) {
    const vecBuilder25 = vecBuilder23.addVec();
    for (const vecEntry26 of vecEntry24) {
      vecBuilder25.addI32(vecEntry26);
    }
  }
  fnBuilder.addI32(uniqueId);
  const vecBuilder27 = fnBuilder.addVec();
  for (const vecEntry28 of requiredEvmChainSupport) {
    vecBuilder27.addString(vecEntry28);
  }
  return fnBuilder.getBytes();
}

export function startGameAndPlaceBet(contractJar: Buffer, initialization: Buffer, abi: Buffer,betAmount: number,choice:number): Buffer {
  const fnBuilder = new FnRpcBuilder("start_game_and_place_bet", fileAbi.contract);
  // fnBuilder.addVecU8(contractJar);
  // fnBuilder.addVecU8(initialization);
  // fnBuilder.addVecU8(abi);
  fnBuilder.addU64(betAmount);
  fnBuilder.addEnumVariant(choice);
  return fnBuilder.getBytes();
}

export function addRandomnessToFlip(contractJar: Buffer, initialization: Buffer, abi: Buffer): Buffer {
  const fnBuilder = new FnRpcBuilder("add_randomness_to_flip", fileAbi.contract);
  // fnBuilder.addVecU8(contractJar);
  // fnBuilder.addVecU8(initialization);
  // fnBuilder.addVecU8(abi);
  // fnBuilder.addI8(1);
  
  return fnBuilder.getBytes();
}

export function flipCoin(contractJar: Buffer, initialization: Buffer, abi: Buffer): Buffer {
  const fnBuilder = new FnRpcBuilder("flip_coin", fileAbi.contract);
  // fnBuilder.addVecU8(contractJar);
  // fnBuilder.addVecU8(initialization);
  // fnBuilder.addVecU8(abi);
  return fnBuilder.getBytes();
}

export function payoutWinner(contractJar: Buffer, initialization: Buffer, abi: Buffer): Buffer {
  const fnBuilder = new FnRpcBuilder("payout_winner", fileAbi.contract);
  // fnBuilder.addVecU8(contractJar);
  // fnBuilder.addVecU8(initialization);
  // fnBuilder.addVecU8(abi);
  return fnBuilder.getBytes();
}