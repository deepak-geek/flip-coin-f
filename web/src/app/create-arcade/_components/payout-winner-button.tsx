'use client';

import { ChainActionButton } from '@/components/chain-action-button';
import { useIdentity } from '@/components/context/identity/identity.context';
import { payoutWinnerGame } from '@/server/create-arcade/deploy-game';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';

const ZK_CONTRACT = '032ff610b96c5cf1e8077d6b34560456f4f23a7f3d';

export const PayoutWinnerButton = () => {
  const router = useRouter();
  const identity = useIdentity();
  console.log("User Identity", identity);
  if (!identity) return <h6 className='text-red-600'>Please connect wallet</h6>;
  const endGame=()=>{
      confetti();
  }
  return (
    <ChainActionButton
      action={() =>payoutWinnerGame(identity.address,ZK_CONTRACT)}
      onSuccess={(txHash) => {
        endGame();
        setTimeout(()=>{
          router.push(`/`);
        },200)
      }}
    >
      Payout Winner
    </ChainActionButton>
  );
};
