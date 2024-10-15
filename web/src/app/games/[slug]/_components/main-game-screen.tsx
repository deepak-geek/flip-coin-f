'use client';

import { useGameState } from '@/components/context/game-state.context';
import { GuessTheNumberGameScreen } from './game-screens/guess-the-number-game-screen';
import { PreGameScreen } from './game-screens/pre-game-screen';

export const MainGameScreen = () => {
  const { gameState, actualGame: game } = useGameState();
  const { currentGame } = gameState;

  if (currentGame.index === 0 && currentGame.status === 'not-started') {
    return <PreGameScreen />;
  }

  if (game.kind === 'flip-coin') {
    return <GuessTheNumberGameScreen game={game} />;
  }

  return null;
};
