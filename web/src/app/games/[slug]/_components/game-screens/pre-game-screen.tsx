import { ChainActionButton } from '@/components/chain-action-button';
import { useGameState } from '@/components/context/game-state.context';
import { PlayerGrid } from '../players/player-grid';
import { GameHeadline } from '../typography/game-headline';

export const PreGameScreen = () => {
  const { isInGame, contractId, isAdmin} = useGameState();

  if (isAdmin) {
    return <PlayerGrid />;
  }

  if (!isInGame) {
    return (
      <div className='text-center'>
        <PlayerGrid />
      </div>
    );
  }

  return (
    <div className='text-center'>
      <GameHeadline>You are signed up!</GameHeadline>
      <PlayerGrid />
    </div>
  );
};
