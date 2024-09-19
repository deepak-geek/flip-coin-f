import { ServerIdentityProvider } from '@/components/context/identity/server-identity-provider';
import { getPendingGameSettings } from '@/server/create-arcade/get-pending-game-settings';
import { GAMES } from '@/config';
import { GamePreviewCard } from '../create-arcade/_components/game-preview-card';
import { PayoutWinnerButton } from '../create-arcade/_components/payout-winner-button';

export default async function WinnerGame() {
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
          Game Winner
        </h1>
        <div className='flex justify-center'>
        {settings.length > 0 && (
          <ServerIdentityProvider>
            <PayoutWinnerButton />
          </ServerIdentityProvider>
        )}
        </div>
      </div>
      </div>
    </>
  );
}
