import { ServerIdentityProvider } from '@/components/context/identity/server-identity-provider';
import { getPendingGameSettings } from '@/server/create-arcade/get-pending-game-settings';
import { GAMES } from '@/config';
import { GamePreviewCard } from '../_components/game-preview-card';
import { FlipCoinRandomButton } from '../_components/flip-coin-random-button';
import './style.css';
import Coin from '../_components/Coin';
export default async function StartGame() {
  const settings = getPendingGameSettings();

  return (
    <>
      <div className='flex justify-center gap-4'>
        <div className=' w-1/3 text-center'>
          {GAMES.map((game) => (
            <GamePreviewCard
              key={game.title}
              game={game}
            />
          ))}
          <h1 className='mb-6 text-2xl text-center font-bold mt-5'>
            Flip Coin Random
          </h1>
          <Coin side="loading"/>
          <div className='flex justify-center mt-3'>
            {settings.length > 0 && (
              <ServerIdentityProvider>
                <FlipCoinRandomButton />
              </ServerIdentityProvider>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
