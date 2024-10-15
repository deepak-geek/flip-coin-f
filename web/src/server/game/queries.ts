
export const getGameContractByTransactionQuery = `
  query GetGameContractByTransaction($identifier: HASH!) {
    transaction(identifier: $identifier) {
      event {
        events {
          ... on InnerTransaction {
            events {
              ... on InnerCallback {
                events {
                  ... on InnerCallbackToContract {
                    events {
                      ... on InnerDeploy {
                        address
                        executionSucceeded
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }`;
export const getContractQuery=`
    query ContractSingleHeaderQuery($identifier: BLOCKCHAIN_ADDRESS!) {
       contract(address: $identifier) {
       ...ContractDetails_Contract
       id
      }
    }
    fragment ContractDetails_Contract on Contract {
      gasBalance
      storageSize
      deployment {
        transaction {
          identifier
          productionTime
          id
        }
        id
      }
      latestInteraction {
        transaction {
            identifier
            productionTime
            id
        }
        id
      }
      estimatedExpirationDate
    }
`;


export const getTransactionsQuery=`
    query LatestTransactionTableQuery($filter: TransactionFilter!) {
      ...LatestTransactionTable_Fragment_Vt7Yj
    }
    fragment LatestTransactionTable_Fragment_Vt7Yj on Query {
      latestTransactions(first: 20, filter: $filter) {
         pageInfo {
            hasNextPage
            endCursor
         }
         edges {
           node {
             ...TransactionTable_Transaction
             id
             __typename
           }
           cursor
         }
        }
      }
      fragment TransactionTable_Transaction on Transaction {
        identifier
        productionTime
        completeExecutionStatus
        from
        contractId
        event {
          action
          id
        }
      }
`;

export const getContractStateQuery=`
  query ContractStateQuery($identifier: BLOCKCHAIN_ADDRESS!) {
     contract(address: $identifier) {
        publicState
        serializedState
        id
     }
  }
`;

export const getUserStateQuery=`
query CoinsQuery($address: BLOCKCHAIN_ADDRESS!
  $isInteractable: Boolean!
) {
  account(address: $address) {
    ...NonBridgeableCoins_Account
    ...Byoc_Account @skip(if: $isInteractable)
    id
  }
  ...Byoc_BridgeCoins @include(if: $isInteractable)
}

fragment ApproveDialog_BridgeCoins on Query {
  bridgeCoins {
    coinSymbol
    decimals
  }
}

fragment Byoc_Account on Account {
  displayCoins {
    symbol
    balance
    conversionRate
    balanceAsGas
  }
}

fragment Byoc_BridgeCoins on Query {
  ...DepositDialog_BridgeCoins
  ...ApproveDialog_BridgeCoins
  ...WithdrawDialog_BridgeCoins
}

fragment DepositDialog_BridgeCoins on Query {
  bridgeCoins {
    coinSymbol
    decimals
    depositMaximum
    depositMinimum
  }
}

fragment NonBridgeableCoins_Account on Account {
  mpc20Balances {
    contract
    symbol
    balance
  }
}

fragment WithdrawDialog_BridgeCoins on Query {
  bridgeCoins {
    coinSymbol
    decimals
    withdrawMaximum
    withdrawMinimum
    externalSmallOracleNonce
  }
}
`;