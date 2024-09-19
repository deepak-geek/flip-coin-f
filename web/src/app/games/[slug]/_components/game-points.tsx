import { GameState } from '@/server/game/get-game-state';
import { FC } from 'react';

type Props = {
  game: GameState['games'][number];
};

export const GamePoints: FC<Props> = ({ game }) => {
  if (game.kind === 'flip-coin') {
    return <>Winner gets {game.winnerPoint} points</>;
  }

  return null;
};
