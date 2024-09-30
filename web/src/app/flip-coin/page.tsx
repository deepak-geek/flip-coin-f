import { ServerIdentityProvider } from '@/components/context/identity/server-identity-provider';
import { getPendingGameSettings } from '@/server/create-arcade/get-pending-game-settings';
import { GAMES } from '@/config';
import { GamePreviewCard } from '../create-arcade/_components/game-preview-card';
import { FlipCoinButton } from '../create-arcade/_components/flip-coin-button';
import Coin from '../_components/Coin';

export default async function StartGame() {
  const settings = getPendingGameSettings();
  
  return (
    <>
     <div className='flex justify-center gap-4'>
      <div className='w-1/3 text-center'>
      {GAMES.map((game) => (
            <GamePreviewCard
              key={game.title}
              game={game}
            />
          ))}
        <h1 className='mb-6 text-2xl text-center font-bold mt-5'>
          Flip Coin
        </h1>
        <Coin side="loading"/>
        <div className='flex justify-center mt-3'>
        {settings.length > 0 && (
          <ServerIdentityProvider>
            <FlipCoinButton />
          </ServerIdentityProvider>
        )}
        </div>
      </div>
      </div>
    </>
  );
}
