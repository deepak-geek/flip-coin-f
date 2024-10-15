'use client';
import { useGameState } from '@/components/context/game-state.context';
import { useIdentity } from '@/components/context/identity/identity.context';
import { FC } from 'react';
import { GuessTheNumberAdmin } from './guess-the-number-admin';
import { AdminActionBox } from './admin-action-box';

type Props = {};

export const NextGameButton: FC<Props> = ({}) => {
  const {
    gameState: { currentGame, games },
    isAdmin,
    contractId,
    actualGame: game,
    isGameEnded,
  } = useGameState();
  const identity = useIdentity();

  if (!identity || !isAdmin || isGameEnded) return null;

  const status = currentGame.status;

  // For this game, it will start when we input a secret number
  if (game.kind === 'flip-coin' && status === 'not-started') {
    return <GuessTheNumberAdmin />;
  }

  if (status === 'in-progress') {
    return (
      <AdminActionBox>

      </AdminActionBox>
    );
  }

  return (
    <AdminActionBox>
     
    </AdminActionBox>
  );
};
