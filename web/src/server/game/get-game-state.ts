import { deserializeCoinFlipState } from '@/contracts_gen/clients/flip-coin';
import { getContractState } from '../partisia.client';

export type GuessTheNumberGame = {
  kind: 'flip-coin';
  winnerPoint: number;
  wrongGuesses: number[];
  winner: number | undefined;
};


export type GameState = {
  administrator: string;
  players: string[];
  currentGame: {
    index: number;
    status: 'not-started' | 'in-progress' | 'finished' | 'calculating';
  };
  games: Array<GuessTheNumberGame>;
  points: Array<Array<number>>;
  engineKeys: string[];
  secretVariablesOwners: string[];
};

export const getGameState = async (id: string): Promise<any | null> => {
  try {
    if (id === 'test' || id === '000000000000000000000000000000000000000000')
      return getTestState();

    const contractState = await getContractState(id, deserializeCoinFlipState);
    if (contractState.type !== 'ZERO_KNOWLEDGE') {
      throw new Error('Invalid contract type');
    }

    const state = contractState.serializedContract.openState.openState.data;
    const { variables } = contractState.serializedContract;
    return {
      secretVariablesOwners: variables.map((v) => v.value.owner),
      engineKeys: contractState.serializedContract.engines.engines.map(
        (e) => e.publicKey,
      )
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getTestState = (): GameState => ({
  administrator: '00944a6e30da930df677f0db098f64bac1b33869ee',
  currentGame: {
    index: 2,
    status: 'calculating',
  },
  players: [
    '00527092bfb4b35a0331fe066199a41d45c213c368',
    '00527092bfb4b35a0331fe066199a41d45c213c367',
    '00527092bfb4b35a0331fe066199a41d45c213c366',
    '00527092bfb4b35a0331fe066199a41d45c213c365',
    '00527092bfb4b35a0331fe066199a41d45c213c364',
    '00527092bfb4b35a0331fe066199a41d45c213c363',
    '00527092bfb4b35a0331fe066199a41d45c213c362',
    '00527092bfb4b35a0331fe066199a41d45c213c361',
    '00527092bfb4b35a0331fe066199a41d45c213c360',
  ],
  games: [
    {
      kind: 'flip-coin',
      winnerPoint: 0,
      wrongGuesses: [10, 15, 13],
      winner: undefined,
    },
  ],
  points: [
    [1, 1, 1],
    [1100, 1, 1],
    [1100, 0, 0],
  ],
  engineKeys: [
    'Ax3kZlMV9JW6EE/74YO9X8Y7zVeD8TubNlBaY+IMfARg',
    'Ax3kZlMV9JW6EE/74YO9X8Y7zVeD8TubNlBaY+IMfARg',
    'Ax3kZlMV9JW6EE/74YO9X8Y7zVeD8TubNlBaY+IMfARg',
    'Ax3kZlMV9JW6EE/74YO9X8Y7zVeD8TubNlBaY+IMfARg',
  ],
  secretVariablesOwners: [
    '00527092bfb4b35a0331fe066199a41d45c213c368',
    '00527092bfb4b35a0331fe066199a41d45c213c367',
  ],
});
