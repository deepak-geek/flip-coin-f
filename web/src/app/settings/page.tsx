import { ServerIdentityProvider } from '@/components/context/identity/server-identity-provider';
import { getPendingGameSettings } from '@/server/create-arcade/get-pending-game-settings';
import { getCurrentUserState } from '@/server/game/get-game-contract-by-transaction';

import { fetchIdentity } from '@/server/user/cookie-auth';
import { maskAddress } from '@/helpers';
import { TransferButton } from '../_components/transfer-button';
import { Input } from '@/components/ui/input';
import GetTokenInput from '../_components/get-token-input';

export default async function Page() {
  const settings = getPendingGameSettings();
  const identity: any = await fetchIdentity();
  if (!identity) {
    return <h2>Wallet Not Connected</h2>;
  }
  const { account } = await getCurrentUserState(identity?.address);

  return (
    <>
      <div className=''>
        <div className='w-full'>
          <h1 className='mb-6 text-3xl font-bold mt-5'>
            Profile Settings
          </h1>
          <div>
            {/* Personal details */}
            <h1 className='font-bold text-2xl mt-2'>Personal</h1>
            <div>
              <span className='text-xl'>Address : </span>
              <span className='ms-2'>{identity?.address}</span>
            </div>
            <div>
              <span className='text-xl'>Seed : </span>
              <span className='ms-2'>{identity?.address}</span>
            </div>
            {/* wallet details */}
            <h1 className='font-bold text-2xl mt-2'>Wallet</h1>
            <div>
              <span className='text-xl'>Publisher : </span>
              <span className='ms-2'>{identity?.wallet?.account?.pub}</span>
            </div>
            <div>
              <span className='text-xl'>Shard : </span>
              <span className='ms-2'>{identity?.wallet?.account?.shard_id}</span>
            </div>
            <div className='w-1/2 mt-3'> 
               <GetTokenInput />
            </div>
            {/* transfer payment */}

            <div className='my-3'>
              {
                <ServerIdentityProvider>
                  <TransferButton />
                </ServerIdentityProvider>
              }
            </div>
            {/* coins details */}
            <h1 className='font-bold text-2xl mt-2'>Coins</h1>
            <div className='flex flex-wrap my-3'>
              {
                account?.displayCoins?.map((dCoin: any, index: number) =>
                  <div className='border border-1 p-3 rounded' key={index}>
                    <h4 className='text-center text-xl'>{dCoin?.symbol}</h4>
                    <p className='text-center font-bold'>{dCoin?.balance}</p>
                    <div>Rate: {dCoin?.conversionRate}</div>
                    <div>Gas: {dCoin?.balanceAsGas}</div>
                  </div>
                )
              }
            </div>

            {/* mpc 20 balance */}
            <h1 className='font-bold text-2xl mt-2'>MPC 20 Balances</h1>
            <div className='flex flex-wrap my-3 gap-3'>
              {
                account?.mpc20Balances?.map((dCoin: any, index: number) =>
                  <div className='border border-1 p-3 rounded' key={index}>
                    <h4 className='text-center text-xl my-2'>{dCoin?.symbol}</h4>
                    <div>Balance: {dCoin?.balance}</div>
                    <div className=''>Contract: {maskAddress(dCoin?.contract)}</div>
                  </div>
                )
              }
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
