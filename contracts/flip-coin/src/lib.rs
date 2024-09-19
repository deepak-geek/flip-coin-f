#![doc = include_str!("../README.md")]
#![allow(unused_variables)]

#[macro_use]
extern crate pbc_contract_codegen;
extern crate pbc_contract_common;
extern crate pbc_lib;

mod zk_compute;

use create_type_spec_derive::CreateTypeSpec;
use pbc_contract_common::address::Address;
use pbc_contract_common::context::ContractContext;
use pbc_contract_common::events::EventGroup;
use pbc_contract_common::sorted_vec_map::SortedVecMap;
use pbc_contract_common::zk::{SecretVarId, ZkInputDef, ZkState, ZkStateChange};

use read_write_rpc_derive::ReadWriteRPC;
use pbc_zk::{Sbi8, SecretBinary};
use read_write_state_derive::ReadWriteState;

use crate::zk_compute::RandomnessInput;
use pbc_traits::ReadRPC;

/**
 * Metadata information associated with each individual variable.
 */
#[derive(ReadWriteState, ReadWriteRPC, Debug)]
#[repr(u8)]
pub enum SecretVarType {
    #[discriminant(0)]
    Randomness {},
    #[discriminant(1)]
    FlipResult {},
}

#[derive(ReadWriteState, ReadWriteRPC, Debug, PartialEq, Copy, Clone, CreateTypeSpec)]
#[repr(u8)]
pub enum PlayerChoice {
    #[discriminant(0)]
    Heads {},
    #[discriminant(1)]
    Tails {},
}


/// The state of the coin flip game, which is persisted on-chain.
#[state]
pub struct CoinFlipState {
    // The address of the player.
    player: Option<Address>,
    // The amount the player has bet.
    player_bet: Option<u64>,
    // The player's choice (Heads or Tails).
    player_choice: Option<PlayerChoice>,
    // The result of the coin flip.
    flip_result_id: Option<SecretVarId>,
    // The result of the coin flip.
    flip_result: Option<bool>, // true = heads, false = tails
    // The winner of the game.
    winner: Option<Address>,
    // User balances of BET tokens.
    user_balances: SortedVecMap<Address, u64>,
    // The phase of the game.
    game_phase: GamePhase,
}

#[allow(dead_code)]
impl CoinFlipState {
    fn is_game_finished(&self) -> bool {
        self.flip_result.is_some()
    }

    fn get_winner(&self) -> Option<Address> {
        self.winner
    }

    fn adjust_balance(&mut self, user: Address, amount: u64) {
        if let Some(balance) = self.user_balances.get_mut(&user) {
            *balance += amount;
        } else {
            self.user_balances.insert(user, amount);
        }
    }
}

#[derive(CreateTypeSpec, SecretBinary)]
pub struct RandomContribution {
    result: Sbi8,
}

#[derive(ReadWriteRPC, ReadWriteState, CreateTypeSpec, Debug, PartialEq, Copy, Clone)]
pub enum GamePhase {
    #[discriminant(0)]
    Start {},
    #[discriminant(1)]
    PlaceBets {},
    #[discriminant(2)]
    FlipCoin {},
    #[discriminant(3)]
    Done {},
}

/// Initialize a new coin flip game with a single player.
#[init(zk = true)]
pub fn initialize(
    context: ContractContext,
    zk_state: ZkState<SecretVarType>,
    player: Address,  // Player's address
) -> (CoinFlipState, Vec<EventGroup>) {
    let state = CoinFlipState {
        player: Some(player),
        player_bet: None,
        player_choice: None,
        flip_result_id: None,
        flip_result: None,
        winner: None,
        user_balances: SortedVecMap::new(),
        game_phase: GamePhase::Start {},
    };

    (state, vec![])
}

/// Start the game, place the bet, and choose Heads or Tails.
#[action(shortname = 0x01, zk = true)]
pub fn start_game_and_place_bet(
    context: ContractContext,
    mut state: CoinFlipState,
    zk_state: ZkState<SecretVarType>,
    bet_amount: u64,
    choice: PlayerChoice,  // Player's choice: Heads or Tails
) -> (CoinFlipState, Vec<EventGroup>, Vec<ZkStateChange>) {
    // Ensure the game is in the Start phase before placing a bet.
    assert_eq!(
        state.game_phase,
        GamePhase::Start {},
        "The game must be in the Start phase to place a bet."
    );

    // Ensure that only the registered player can place a bet.
    assert_eq!(
        state.player,
        Some(context.sender),
        "Only the registered player can place a bet."
    );

    // Set the player's bet and their choice (Heads or Tails).
    state.player_bet = Some(bet_amount);
    state.player_choice = Some(choice);
    state.game_phase = GamePhase::FlipCoin {};

    (state, vec![], vec![])
}

/// Add randomness for the coin flip.
#[zk_on_secret_input(shortname = 0x40, secret_type = "RandomContribution")]
pub fn add_randomness_to_flip(
    context: ContractContext,
    state: CoinFlipState,
    zk_state: ZkState<SecretVarType>,
) -> (
    CoinFlipState,
    Vec<EventGroup>,
    ZkInputDef<SecretVarType, RandomContribution>,
) {
    assert_eq!(
        state.game_phase,
        GamePhase::FlipCoin {},
        "Must be in the FlipCoin phase to input secret randomness."
    );

    let input_def = ZkInputDef::with_metadata(
        Some(SHORTNAME_INPUTTED_VARIABLE),
        SecretVarType::Randomness {},
    );

    (state, vec![], input_def)
}

/// Automatically called when a variable is confirmed on chain.
#[zk_on_variable_inputted(shortname = 0x01)]
fn inputted_variable(
    context: ContractContext,
    mut state: CoinFlipState,
    zk_state: ZkState<SecretVarType>,
    variable_id: SecretVarId,
) -> CoinFlipState {
    state
}

/// Start the computation to compute the coin flip result.
#[action(shortname = 0x03, zk = true)]
pub fn flip_coin(
    context: ContractContext,
    state: CoinFlipState,
    zk_state: ZkState<SecretVarType>,
) -> (CoinFlipState, Vec<EventGroup>, Vec<ZkStateChange>) {
    assert_eq!(
        state.game_phase,
        GamePhase::FlipCoin {},
        "The coin can only be flipped in the FlipCoin phase"
    );

    (
        state,
        vec![],
        vec![zk_compute::compute_coin_flip_start(
            Some(SHORTNAME_FLIP_COMPUTE_COMPLETE),
            &SecretVarType::FlipResult {},
        )],
    )
}

/// Automatically called when the coin flip computation is completed.
#[zk_on_compute_complete(shortname = 0x01)]
fn flip_compute_complete(
    context: ContractContext,
    state: CoinFlipState,
    zk_state: ZkState<SecretVarType>,
    output_variables: Vec<SecretVarId>,
) -> (CoinFlipState, Vec<EventGroup>, Vec<ZkStateChange>) {
    (
        state,
        vec![],
        vec![ZkStateChange::OpenVariables {
            variables: output_variables,
        }],
    )
}

/// Automatically called when the flip result variable is opened.
#[zk_on_variables_opened]
fn open_flip_result_variable(
    context: ContractContext,
    mut state: CoinFlipState,
    zk_state: ZkState<SecretVarType>,
    opened_variables: Vec<SecretVarId>,
) -> (CoinFlipState, Vec<EventGroup>, Vec<ZkStateChange>) {
    assert_eq!(
        opened_variables.len(),
        1,
        "Unexpected number of output variables"
    );

    let opened_variable = zk_state
        .get_variable(*opened_variables.first().unwrap())
        .unwrap();

    if let SecretVarType::FlipResult {} = opened_variable.metadata {
        if let Some(data) = opened_variable.data {
            let randomness_input = RandomnessInput {
                result: Sbi8::from(data[0] as i8),
            };

            let flip_result = zk_compute::parse_compute_output(randomness_input);  // true = heads, false = tails

            state.flip_result = Some(flip_result);
            state.game_phase = GamePhase::Done {};

            // Determine the winner based on the player's choice and the flip result
            if let Some(player_choice) = state.player_choice {
                if (player_choice == PlayerChoice::Heads {} && flip_result) ||
                   (player_choice == PlayerChoice::Tails {} && !flip_result) {
                    state.winner = Some(state.player.unwrap()); // Player wins
                } else {
                    state.winner = Some(context.contract_address); // Main contract wins
                }
            }
        } else {
            panic!("Expected data in the opened variable, but found None.");
        }
    }

    (state, vec![], vec![])
}

/// Payout the winner.
#[action(shortname = 0x04, zk = true)]
pub fn payout_winner(
    context: ContractContext,
    mut state: CoinFlipState,
    zk_state: ZkState<SecretVarType>,
) -> (CoinFlipState, Vec<EventGroup>, Vec<ZkStateChange>) {
    assert_eq!(
        state.game_phase,
        GamePhase::Done {},
        "The game must be done to payout the winner."
    );

    let winner = state
        .winner
        .expect("The game must have a winner to payout.");

    let bet_amount = state.player_bet.unwrap_or(0);
    let payout_amount = bet_amount * 2;

    state.adjust_balance(winner, payout_amount);

    (state, vec![], vec![])
}
