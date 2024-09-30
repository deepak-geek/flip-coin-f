'use client';

import { ChainActionButton } from '@/components/chain-action-button';
import { useIdentity } from '@/components/context/identity/identity.context';
import { payoutWinnerGame } from '@/server/create-arcade/deploy-game';
import { getGameContractByTransaction } from '@/server/game/get-game-contract-by-transaction';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';

const ZK_CONTRACT = '036076e6bd361e99f6a6503cfbc6c2e655257f38a1';

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
      onSuccess={async(txHash) => {
        console.log("payout winner game success",txHash);
        const result = await getGameContractByTransaction(txHash);
        // if (result.result === 'success') {
        //   console.log(result)
          endGame();
          setTimeout(()=>{
             router.push(`/`);
          },500)
        // }
        // if (result.result === 'execution-failed') {
        //   console.log(
        //     'The deployment of this contract failed. Maybe there is not enough gas.',
        //   );
        // }
        
      }}
    >
      Payout Winner
    </ChainActionButton>
  );
};
