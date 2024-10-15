export type Game = {
  id: string;
  title: string;
  description: string;
};

export const FLIP_COIN = {
  id: 'flip-coin',
  title: 'Flip Coin',
  description:
    'User flip coin and win.',
} as const satisfies Game;

export const GAMES = [FLIP_COIN] as const;
