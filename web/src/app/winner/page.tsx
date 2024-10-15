import { ServerIdentityProvider } from '@/components/context/identity/server-identity-provider';
import { getPendingGameSettings } from '@/server/create-arcade/get-pending-game-settings';
import { GAMES } from '@/config';
import { GamePreviewCard } from '../_components/game-preview-card';
import { PayoutWinnerButton } from '../_components/payout-winner-button';
import { getContractState } from '@/server/partisia.client';
import { deserializeCoinFlipState } from '@/contracts_gen/clients/flip-coin';
import HowToPlay from '../_components/HowToPlay';
import { fetchIdentity } from '@/server/user/cookie-auth';
import { BlockchainAddress } from '@partisiablockchain/abi-client';

export default async function WinnerGame() {
  const identity:any=(await fetchIdentity())?.address||'';
  const address= new BlockchainAddress(Buffer.from(identity,'hex'));
  const settings = getPendingGameSettings();
  const contract:any= await getContractState('0338bd7fd7a04b70cd185c702318e0a81128e2fa44',deserializeCoinFlipState);
  const winners= contract?.serializedContract?.openState?.openState?.data?.winners;
  console.log("winners",winners.get(address),address,contract?.serializedContract?.openState?.openState?.data);
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
         <h2 className='mb-6 text-2xl text-center font-bold mt-5'>
          { winners ? (
           (winners.get(address)==address) ? 'Congratulations! You won the game. Your bet amount has been paid out.':
              "Better Luck Next Time"):""
          }
        </h2>
        <div className='flex justify-center'>
        {settings.length > 0 && (
          <ServerIdentityProvider>
            <PayoutWinnerButton />
          </ServerIdentityProvider>
        )}
        </div>
      </div>
      </div>
      <HowToPlay />
    </>
  );
}
