'use client';
import { ChainActionButton } from '@/components/chain-action-button';
import { useIdentity } from '@/components/context/identity/identity.context';
import { flipCoinRandomGame } from '@/server/create-arcade/deploy-game';
import { useRouter } from 'next/navigation';

const ZK_CONTRACT = '036076e6bd361e99f6a6503cfbc6c2e655257f38a1';

export const FlipCoinRandomButton = () => {
  const router = useRouter();
  const identity = useIdentity();
  console.log("User Identity", identity);
  if (!identity) return <h6 className='text-red-600'>Please connect wallet</h6>;
  
  const flip=()=>{
      const flipCoin:any = document.querySelector('.flip-coin');
      flipCoin.style.animation = 'flip 1.5s ease-in-out';
      
      setTimeout(() => {
        const randomSide = Math.random() > 0.5 ? 'Heads' : 'Tails';
        alert(`You got ${randomSide}!`);
      }, 1500);
  }
  return (
    <ChainActionButton
      action={() =>flipCoinRandomGame(identity.address,ZK_CONTRACT)}
      onSuccess={(txHash) => {
        router.push(`/flip-coin`);
      }}
    >
      Flip Coin Randomness
    </ChainActionButton>
  );
};
