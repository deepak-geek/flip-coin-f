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
use pbc_contract_common::sorted_vec_map::{SortedVecMap, SortedVecSet};
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
    /// Randomness used for the coin flip.
    Randomness {},
    #[discriminant(1)]
    /// Result of the coin flip.
    FlipResult {},
}

/// The state of the coin flip game, which is persisted on-chain.
#[state]
pub struct CoinFlipState {
    // The current amount of randomness contributions received for a coin flip.
    nr_of_randomness_contributions: u32,
    // The players in the game.
    players: Vec<Address>,
    // The current phase the game is in, to determine allowed actions.
    game_phase: GamePhase,
    // The amount each player has bet.
    bets: SortedVecMap<Address, u64>,
    // The results of the coin flip.
    flip_result_id: Option<SecretVarId>,
    // The results of the coin flip.
    flip_result: Option<bool>,
    // The winner of the game.
    winner: Option<Address>,
    // User balances of BET tokens
    user_balances: SortedVecMap<Address, u64>,
}

#[allow(dead_code)]
impl CoinFlipState {
    /// Check whether the game is finished.
    fn is_game_finished(&self) -> bool {
        self.flip_result.is_some()
    }

    /// Get the winner of the game.
    fn get_winner(&self) -> Address {
        self.winner.unwrap()
    }

    /// Adjust the balance of a user.
    fn adjust_balance(&mut self, user: Address, amount: u64) {
        if let Some(balance) = self.user_balances.get_mut(&user) {
            *balance += amount;
        } else {
            self.user_balances.insert(user, amount);
        }
    }
}

/// The contribution each player must send to make a dice throw. The contributions should be in the
/// interval \[ 0, 5 \] inclusive. If the contributions are outside this interval,
/// they are normalized to the interval.
#[derive(CreateTypeSpec, SecretBinary)]
pub struct RandomContribution {
    result: Sbi8,
}

/// The different phases the contract can be in before, during and after a game of coin flip.
#[derive(ReadWriteRPC, ReadWriteState, CreateTypeSpec, Debug, PartialEq, Copy, Clone)]
pub enum GamePhase {
    #[discriminant(0)]
    /// The game has been initialized.
    Start {},
    #[discriminant(1)]
    /// Players can place their bets.
    PlaceBets {},
    #[discriminant(2)]
    /// The coin can be flipped.
    FlipCoin {},
    #[discriminant(3)]
    /// The game is finished.
    Done {},
}

/// Initialize a new coin flip game.
///
/// # Arguments
///
/// * `_ctx` - the contract context containing information about the sender and the blockchain.
/// * `addresses_to_play` - the list of addresses participating in the game.
///
/// # Returns
///
/// The initial state of the game.
#[init(zk = true)]
pub fn initialize(
    context: ContractContext,
    zk_state: ZkState<SecretVarType>,
    addresses_to_play: Vec<Address>,
) -> (CoinFlipState, Vec<EventGroup>) {
    assert!(
        addresses_to_play.len() >= 2,
        "There must be at least 2 players to play the coin flip game."
    );
    assert_eq!(
        SortedVecSet::from(addresses_to_play.clone()).len(),
        addresses_to_play.len(),
        "No duplicates in players."
    );

    let state = CoinFlipState {
        players: addresses_to_play.clone(),
        nr_of_randomness_contributions: 0,
        game_phase: GamePhase::Start {},
        bets: SortedVecMap::new(),
        flip_result_id: None,
        flip_result: None,
        winner: None,
        user_balances: SortedVecMap::new(),
    };

    (state, vec![])
}

/// Start placing bets.
///
/// # Arguments
///
/// * `ctx` - the contract context containing information about the sender and the blockchain.
/// * `state` - the current state of the game.
///
/// # Returns
///
/// The updated game state.
#[action(shortname = 0x01, zk = true)]
pub fn start_betting(
    context: ContractContext,
    mut state: CoinFlipState,
    zk_state: ZkState<SecretVarType>,
) -> (CoinFlipState, Vec<EventGroup>, Vec<ZkStateChange>) {
    assert!(
        state.players.contains(&context.sender),
        "Only players in the game can start betting."
    );
    state.game_phase = GamePhase::PlaceBets {};

    (state, vec![], vec![])
}

/// Place a bet for the coin flip.
///
/// # Arguments
///
/// * `ctx` - the contract context containing information about the sender and the blockchain.
/// * `state` - the current state of the game.
/// * `bet_amount` - the amount the player is betting.
///
/// # Returns
///
/// The updated game state.
#[action(shortname = 0x02, zk = true)]
pub fn place_bet(
    context: ContractContext,
    mut state: CoinFlipState,
    zk_state: ZkState<SecretVarType>,
    bet_amount: u64,
) -> (CoinFlipState, Vec<EventGroup>, Vec<ZkStateChange>) {
    assert_eq!(
        state.game_phase,
        GamePhase::PlaceBets {},
        "Must be in the PlaceBets phase to place a bet."
    );
    assert!(state.players.contains(&context.sender));

    state.bets.insert(context.sender, bet_amount);

    if state.bets.len() == state.players.len() {
        state.game_phase = GamePhase::FlipCoin {};
    }

    (state, vec![], vec![])
}

/// Add randomness for the coin flip.
/// The sender must be a player in the game to add randomness.
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
    assert!(state.players.contains(&context.sender));
    assert!(
        zk_state
            .secret_variables
            .iter()
            .chain(zk_state.pending_inputs.iter())
            .all(|(_, secret_variable)| secret_variable.owner != context.sender),
        "Each Player is only allowed to send one contribution to the randomness of the coin flip. Sender: {:?}",
        context.sender
    );

    let input_def = ZkInputDef::with_metadata(
        Some(SHORTNAME_INPUTTED_VARIABLE),
        SecretVarType::Randomness {},
    );

    (state, vec![], input_def)
}

/// Automatically called when a variable is confirmed on chain.
///
/// Initializes the coin flip.
#[zk_on_variable_inputted(shortname = 0x01)]
fn inputted_variable(
    context: ContractContext,
    mut state: CoinFlipState,
    zk_state: ZkState<SecretVarType>,
    variable_id: SecretVarId,
) -> CoinFlipState {
    if state.nr_of_randomness_contributions == state.players.len() as u32 - 1 {
        state.nr_of_randomness_contributions = 0;
        state.game_phase = GamePhase::FlipCoin {};
    } else {
        state.nr_of_randomness_contributions += 1;
    }
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
    assert!(state.players.contains(&context.sender));

    (
        state,
        vec![],
        vec![zk_compute::compute_coin_flip_start(
            Some(SHORTNAME_FLIP_COMPUTE_COMPLETE),
            &SecretVarType::FlipResult {},
        )],
    )
}

/// Automatically called when the coin flip result is computed.
#[zk_on_compute_complete(shortname = 0x01)]
fn flip_compute_complete(
    _context: ContractContext,
    mut state: CoinFlipState,
    zk_state: ZkState<SecretVarType>,
    result: RandomnessInput,
) -> CoinFlipState {
    assert_eq!(
        state.game_phase,
        GamePhase::FlipCoin {},
        "Computation of coin flip result can only complete in FlipCoin phase."
    );

    let id = pbc_zk::SecretVarId::new(0); // Placeholder value, replace with actual ID
    let flip_result = zk_compute::parse_compute_output(result);

    state.flip_result_id = Some(id);
    state.flip_result = Some(flip_result);
    state.game_phase = GamePhase::Done {};

    state
}

impl ReadRPC for RandomnessInput {
    fn rpc_read_from<T>(reader: &mut T) -> RandomnessInput
    where
        T: std::io::Read,
    {
        let mut buffer: [u8; 1] = [0u8; 1]; // Assuming RandomnessInput::result is one byte
        reader.read_exact(&mut buffer).unwrap(); // Propagate the error or handle it properly
       
        let result: Sbi8 = Sbi8::from(buffer[0] as i8);
        RandomnessInput { result }
    }
}

/// Payout the winner of the coin flip.
///
/// # Arguments
///
/// * `ctx` - the contract context containing information about the sender and the blockchain.
/// * `state` - the current state of the game.
///
/// # Returns
///
/// The updated game state.
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

    let winner = state.get_winner();
    let payout = state
        .bets
        .values()
        .sum::<u64>()
        .checked_mul(2)
        .expect("Overflow in payout calculation");

    // Simplified payout logic, replace with actual transfer logic
    state.adjust_balance(winner, payout);

    (state, vec![], vec![])
}
