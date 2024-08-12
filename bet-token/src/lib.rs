#![doc = include_str!("../README.md")]

#[macro_use]
extern crate pbc_contract_codegen;

use create_type_spec_derive::CreateTypeSpec;
use read_write_rpc_derive::ReadWriteRPC;
use std::ops:: Sub;

use pbc_contract_common::address::Address;
use pbc_contract_common::avl_tree_map::AvlTreeMap;
use pbc_contract_common::context::ContractContext;
use pbc_traits::ReadWriteState;
use read_write_state_derive::ReadWriteState;

/// Custom struct for the state of the contract.
#[state]
pub struct TokenState {
    name: String,
    decimals: u8,
    symbol: String,
    owner: Address,
    total_supply: u128,
    airdrop_percentage: u8,
    platform_sales_percentage: u8,
    staking_rewards_percentage: u8,
    owner_percentage: u8, // Field for owner percentage
    airdrop_address: Address, // Field for airdrop address
    platform_sales_address: Address, // Field for platform sales address
    staking_rewards_address: Address, // Field for staking rewards address
    balances: AvlTreeMap<Address, u128>,
    allowed: AvlTreeMap<AllowedAddress, u128>,
}

/// Address pair representing some allowance. Owner allows spender to spend an amount of tokens.
#[derive(ReadWriteState, CreateTypeSpec, Eq, Ord, PartialEq, PartialOrd)]
pub struct AllowedAddress {
    owner: Address,
    spender: Address,
}

/// Extension trait for inserting into a map holding balances.
trait BalanceMap<K: Ord, V> {
    fn insert_balance(&mut self, key: K, value: V);
}

impl<V: Sub<V, Output = V> + PartialEq + Copy + ReadWriteState, K: ReadWriteState + Ord>
    BalanceMap<K, V> for AvlTreeMap<K, V>
{
    fn insert_balance(&mut self, key: K, value: V) {
        let zero = value - value;
        if value == zero {
            self.remove(&key);
        } else {
            self.insert(key, value);
        }
    }
}

impl TokenState {
    pub fn balance_of(&self, owner: &Address) -> u128 {
        self.balances.get(owner).unwrap_or(0)
    }

    pub fn allowance(&self, owner: &Address, spender: &Address) -> u128 {
        self.allowed
            .get(&AllowedAddress {
                owner: *owner,
                spender: *spender,
            })
            .unwrap_or(0)
    }

    fn update_allowance(&mut self, owner: Address, spender: Address, amount: u128) {
        self.allowed
            .insert_balance(AllowedAddress { owner, spender }, amount);
    }

    fn update_allowance_relative(&mut self, owner: Address, spender: Address, delta: i128) {
        let existing_allowance = self.allowance(&owner, &spender);
        let new_allowance = existing_allowance
            .checked_add(delta as u128)
            .expect("Allowance would become negative.");
        self.update_allowance(owner, spender, new_allowance);
    }
}

/// Initial function to bootstrap the contracts state. Must return the state-struct.
#[init]
pub fn initialize(
    ctx: ContractContext,
    name: String,
    symbol: String,
    decimals: u8,
    total_supply: u128,
    airdrop_percentage: u8,
    platform_sales_percentage: u8,
    staking_rewards_percentage: u8,
    owner_percentage: u8,
    airdrop_address: Address,
    platform_sales_address: Address,
    staking_rewards_address: Address,
) -> TokenState {
    let mut balances = AvlTreeMap::new();

    // Validate percentages
    let total_percentage = airdrop_percentage + platform_sales_percentage + staking_rewards_percentage + owner_percentage;
    assert!(total_percentage == 100, "Total percentage must be 100");

    // Distribution amounts based on dynamic percentages
    let airdrop_amount = total_supply * airdrop_percentage as u128 / 100;
    let platform_sales_amount = total_supply * platform_sales_percentage as u128 / 100;
    let staking_rewards_amount = total_supply * staking_rewards_percentage as u128 / 100;
    let owner_amount = total_supply * owner_percentage as u128 / 100;

    // Transfer amounts from owner to the specified addresses
    balances.insert_balance(ctx.sender, total_supply);
    balances.insert_balance(ctx.sender, balances.get(&ctx.sender).unwrap_or(0).checked_sub(airdrop_amount).expect("Insufficient funds for airdrop transfer"));
    balances.insert_balance(airdrop_address, airdrop_amount);
    balances.insert_balance(ctx.sender, balances.get(&ctx.sender).unwrap_or(0).checked_sub(platform_sales_amount).expect("Insufficient funds for platform sales transfer"));
    balances.insert_balance(platform_sales_address, platform_sales_amount);
    balances.insert_balance(ctx.sender, balances.get(&ctx.sender).unwrap_or(0).checked_sub(staking_rewards_amount).expect("Insufficient funds for staking rewards transfer"));
    balances.insert_balance(staking_rewards_address, staking_rewards_amount);
    balances.insert_balance(ctx.sender, balances.get(&ctx.sender).unwrap_or(0).checked_sub(owner_amount).expect("Insufficient funds for owner transfer"));
    balances.insert_balance(ctx.sender, owner_amount);

    TokenState {
        name,
        symbol,
        decimals,
        owner: ctx.sender,
        total_supply,
        airdrop_percentage,
        platform_sales_percentage,
        staking_rewards_percentage,
        owner_percentage,
        airdrop_address,
        platform_sales_address,
        staking_rewards_address,
        balances,
        allowed: AvlTreeMap::new(),
    }
}

/// Represents the type of a transfer.
#[derive(ReadWriteRPC, CreateTypeSpec)]
pub struct Transfer {
    pub to: Address,
    pub amount: u128,
}

pub fn core_transfer(sender: Address, mut state: TokenState, to: Address, amount: u128) -> TokenState {
    let from_amount = state.balance_of(&sender);
    let new_from_amount = from_amount.checked_sub(amount).expect("Insufficient funds for transfer");
    state.balances.insert_balance(sender, new_from_amount);

    let to_amount = state.balance_of(&to);
    state.balances.insert_balance(to, to_amount + amount);

    state
}

pub fn core_transfer_from(
    sender: Address,
    mut state: TokenState,
    from: Address,
    to: Address,
    amount: u128,
) -> TokenState {
    let from_allowed = state.allowance(&from, &sender);
    let new_allowed_amount = from_allowed.checked_sub(amount).expect("Insufficient allowance for transfer_from");
    state.update_allowance(from, sender, new_allowed_amount);

    core_transfer(from, state, to, amount)
}

#[action(shortname = 0x01)]
pub fn transfer(context: ContractContext, state: TokenState, to: Address, amount: u128) -> TokenState {
    core_transfer(context.sender, state, to, amount)
}

#[action(shortname = 0x02)]
pub fn bulk_transfer(
    context: ContractContext,
    mut state: TokenState,
    transfers: Vec<Transfer>,
) -> TokenState {
    for transfer in transfers {
        state = core_transfer(context.sender, state, transfer.to, transfer.amount);
    }
    state
}

#[action(shortname = 0x03)]
pub fn transfer_from(
    context: ContractContext,
    state: TokenState,
    from: Address,
    to: Address,
    amount: u128,
) -> TokenState {
    core_transfer_from(context.sender, state, from, to, amount)
}

#[action(shortname = 0x04)]
pub fn bulk_transfer_from(
    context: ContractContext,
    mut state: TokenState,
    from: Address,
    transfers: Vec<Transfer>,
) -> TokenState {
    for transfer in transfers {
        state = core_transfer_from(context.sender, state, from, transfer.to, transfer.amount);
    }
    state
}

#[action(shortname = 0x05)]
pub fn approve(
    context: ContractContext,
    mut state: TokenState,
    spender: Address,
    amount: u128,
) -> TokenState {
    state.update_allowance(context.sender, spender, amount);
    state
}

#[action(shortname = 0x07)]
pub fn approve_relative(
    context: ContractContext,
    mut state: TokenState,
    spender: Address,
    delta: i128,
) -> TokenState {
    state.update_allowance_relative(context.sender, spender, delta);
    state
}