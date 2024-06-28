#![doc = include_str!("../README.md")]

#[macro_use]
extern crate pbc_contract_codegen;

use create_type_spec_derive::CreateTypeSpec;
use read_write_rpc_derive::ReadWriteRPC;
use std::ops::{Add, Sub};

use pbc_contract_common::address::Address;
use pbc_contract_common::context::ContractContext;
use pbc_contract_common::sorted_vec_map::SortedVecMap;

const TAX_RATE: u128 = 5;

#[state]
pub struct TokenState {
    name: String,
    decimals: u8,
    symbol: String,
    owner: Address,
    total_supply: u128,
    airdrop_percent: u128,
    sales_percent: u128,
    staking_percent: u128,
    owner_percent: u128,
    balances: SortedVecMap<Address, u128>,
    allowed: SortedVecMap<Address, SortedVecMap<Address, u128>>,
    mintable: bool,
}

trait BalanceMap<K: Ord, V> {
    fn insert_balance(&mut self, key: K, value: V);
}

impl<V: Sub<V, Output = V> + PartialEq + Copy> BalanceMap<Address, V> for SortedVecMap<Address, V> {
    #[allow(clippy::eq_op)]
    fn insert_balance(&mut self, key: Address, value: V) {
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
        self.balances.get(owner).copied().unwrap_or(0)
    }

    pub fn owner_balance(&self) -> u128 {
        self.balance_of(&self.owner)
    }

    pub fn allowance(&self, owner: &Address, spender: &Address) -> u128 {
        self.allowed
            .get(owner)
            .and_then(|allowed_from_owner| allowed_from_owner.get(spender))
            .copied()
            .unwrap_or(0)
    }

    fn update_allowance(&mut self, owner: Address, spender: Address, amount: u128) {
        if !self.allowed.contains_key(&owner) {
            self.allowed.insert(owner, SortedVecMap::new());
        }
        let allowed_from_owner = self.allowed.get_mut(&owner).unwrap();
        allowed_from_owner.insert_balance(spender, amount);
    }

    fn update_allowance_relative(&mut self, owner: Address, spender: Address, delta: i128) {
        let existing_allowance = self.allowance(&owner, &spender);
        let new_allowance = existing_allowance
            .checked_add_signed(delta)
            .expect("Allowance would become negative.");
        self.update_allowance(owner, spender, new_allowance);
    }

    fn distribute_supply(&mut self, total_supply: u128, airdrop_addr: Address, sales_addr: Address, staking_addr: Address) {
        let airdrop_amount = total_supply * self.airdrop_percent / 100;
        let sales_amount = total_supply * self.sales_percent / 100;
        let staking_amount = total_supply * self.staking_percent / 100;
        let owner_amount = total_supply * self.owner_percent / 100;

        self.balances.insert_balance(airdrop_addr, airdrop_amount);
        self.balances.insert_balance(sales_addr, sales_amount);
        self.balances.insert_balance(staking_addr, staking_amount);
        self.balances.insert_balance(self.owner, owner_amount);

        let remaining_amount = total_supply - (airdrop_amount + sales_amount + staking_amount + owner_amount);
        self.balances.insert_balance(self.owner, self.balance_of(&self.owner) + remaining_amount);
    }

    fn mint(&mut self, to: Address, amount: u128) {
        if !self.mintable {
            panic!("Token is not mintable");
        }
        self.total_supply += amount;
        let to_amount = self.balance_of(&to);
        self.balances.insert_balance(to, to_amount + amount);
    }

    fn burn(&mut self, from: Address, amount: u128) {
        self.total_supply -= amount;
        let from_amount = self.balance_of(&from);
        self.balances.insert_balance(from, from_amount.checked_sub(amount).unwrap_or(0));
    }
}

#[init]
pub fn initialize(
    ctx: ContractContext,
    name: String,
    symbol: String,
    decimals: u8,
    initial_supply: u128,
    airdrop_percent: u128,
    sales_percent: u128,
    staking_percent: u128,
    owner_percent: u128,
    airdrop_addr: Address,
    sales_addr: Address,
    staking_addr: Address,
) -> TokenState {
    let mut state = TokenState {
        name,
        symbol,
        decimals,
        owner: ctx.sender,
        total_supply: initial_supply,
        airdrop_percent,
        sales_percent,
        staking_percent,
        owner_percent,
        balances: SortedVecMap::new(),
        allowed: SortedVecMap::new(),
        mintable: true,
    };
    state.distribute_supply(initial_supply, airdrop_addr, sales_addr, staking_addr);
    state
}

#[derive(ReadWriteRPC, CreateTypeSpec)]
pub struct Transfer {
    pub to: Address,
    pub amount: u128,
}

#[action(shortname = 0x01)]
pub fn transfer(
    context: ContractContext,
    mut state: TokenState,
    to: Address,
    amount: u128,
) -> TokenState {
    core_transfer(context.sender, &mut state, to, amount)
}

#[action(shortname = 0x02)]
pub fn bulk_transfer(
    context: ContractContext,
    mut state: TokenState,
    transfers: Vec<Transfer>,
) -> TokenState {
    for t in transfers {
        state = core_transfer(context.sender, &mut state, t.to, t.amount);
    }
    state
}

#[action(shortname = 0x03)]
pub fn transfer_from(
    context: ContractContext,
    mut state: TokenState,
    from: Address,
    to: Address,
    amount: u128,
) -> TokenState {
    core_transfer_from(context.sender, &mut state, from, to, amount)
}

#[action(shortname = 0x04)]
pub fn bulk_transfer_from(
    context: ContractContext,
    mut state: TokenState,
    from: Address,
    transfers: Vec<Transfer>,
) -> TokenState {
    for t in transfers {
        state = core_transfer_from(context.sender, &mut state, from, t.to, t.amount);
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

#[action(shortname = 0x08)]
#[allow(unused_variables)]
pub fn mint_tokens(
    context: ContractContext,
    mut state: TokenState,
    to: Address,
    amount: u128,
) -> TokenState {
    state.mint(to, amount);
    state
}

#[action(shortname = 0x09)]
#[allow(unused_variables)]
pub fn burn_tokens(
    context: ContractContext,
    mut state: TokenState,
    from: Address,
    amount: u128,
) -> TokenState {
    state.burn(from, amount);
    state
}

fn core_transfer(
    sender: Address,
    state: &mut TokenState,
    to: Address,
    amount: u128,
) -> TokenState {
    let tax = amount * TAX_RATE / 100;
    let net_amount = amount - tax;

    let from_amount = state.balance_of(&sender);
    let o_new_from_amount = from_amount.checked_sub(amount);
    match o_new_from_amount {
        Some(new_from_amount) => {
            state.balances.insert_balance(sender, new_from_amount);
        }
        None => {
            panic!(
                "Insufficient funds for transfer: {}/{}",
                from_amount, amount
            );
        }
    }
    let to_amount = state.balance_of(&to);
    state.balances.insert_balance(to, to_amount.add(net_amount));

    let owner_amount = state.balance_of(&state.owner);
    state.balances.insert_balance(state.owner, owner_amount.add(tax));

    TokenState {
        name: state.name.clone(),
        decimals: state.decimals,
        symbol: state.symbol.clone(),
        owner: state.owner,
        total_supply: state.total_supply,
        airdrop_percent: state.airdrop_percent,
        sales_percent: state.sales_percent,
        staking_percent: state.staking_percent,
        owner_percent: state.owner_percent,
        balances: state.balances.clone(),
        allowed: state.allowed.clone(),
        mintable: state.mintable,
    }
}

fn core_transfer_from(
    sender: Address,
    state: &mut TokenState,
    from: Address,
    to: Address,
    amount: u128,
) -> TokenState {
    let from_allowed = state.allowance(&from, &sender);
    let o_new_allowed_amount = from_allowed.checked_sub(amount);
    match o_new_allowed_amount {
        Some(new_allowed_amount) => {
            state.update_allowance(from, sender, new_allowed_amount);
        }
        None => {
            panic!(
                "Insufficient allowance for transfer_from: {}/{}",
                from_allowed, amount
            );
        }
    }
    core_transfer(from, state, to, amount)
}
