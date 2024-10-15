'use server';

import { fetchIdentity } from "../user/cookie-auth";
import { getContractQuery, getContractStateQuery, getGameContractByTransactionQuery, getTransactionsQuery, getUserStateQuery } from "./queries";

export const getGameContractByTransaction = async (txHash: string) => {
  const query = {
    query: getGameContractByTransactionQuery,
    variables: {
      identifier: txHash,
    },
  };

  const response = await fetch(
    'https://backend.browser.testnet.partisiablockchain.com/graphql/query',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(query),
    },
  );

  const result = await response.json();
  
  if (!response.ok || !result.data) {
    return { result: 'not-found' };
  }
  // console.log("result data",result);
  // const { executionSucceeded, address } =
  //   result.data?.transaction?.event?.events[0]?.events[0]?.events[0]?.events[0];

  // if (!executionSucceeded) {
  //   return { result: 'execution-failed' };
  // }

  return {
    result: 'success',
    contract: 'address',
  };
};


export const getContractByAddress = async (contract: string) => {
  const query = {
    query: getContractQuery,
    variables: {
      identifier: contract,
    },
  };

  const response = await fetch(
    'https://backend.browser.testnet.partisiablockchain.com/graphql/query',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(query),
    },
  );

  const result = await response.json();
  
  if (!response.ok || !result.data) {
    return { result: 'not-found' };
  }
  console.log("result data",JSON.stringify(result));
};

export const getTransactionsByAddress = async (contract: string) => {
  const query = {
    query: getTransactionsQuery,
    variables:{
      filter: {
        contractId: contract,
        productionTime: null,
        completeExecutionStatus: null,
        actions: []
      }
    },
  };

  const response = await fetch(
    'https://backend.browser.testnet.partisiablockchain.com/graphql/query',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(query),
    },
  );

  const result = await response.json();
  let identity= await fetchIdentity();
  if (!response.ok || !result.data) {
    return { result: 'not-found' };
  }
  let data= result?.data?.latestTransactions?.edges?.filter((ev:any)=>ev?.node?.from == identity?.address);
  return data;
};

export const getCurrentContractsState = async (contract: string) => {
  const query = {
    query: getContractStateQuery,
    variables: {
      identifier: contract,
      showZK: false
    },
  };

  const response = await fetch(
    'https://backend.browser.testnet.partisiablockchain.com/graphql/query',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(query),
    },
  );

  const result = await response.json();
  
  if (!response.ok || !result.data) {
    return { result: 'not-found' };
  }
  return result.data;
};

export const getCurrentUserState = async (address: string) => {
  const query = {
    query: getUserStateQuery,
    variables: {
      address,
      isInteractable: false
    },
  };

  const response = await fetch(
    'https://backend.browser.testnet.partisiablockchain.com/graphql/query',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(query),
    },
  );

  const result = await response.json();
  if (!response.ok || !result.data) {
    return { result: 'not-found' };
  }
  return result.data;
};
