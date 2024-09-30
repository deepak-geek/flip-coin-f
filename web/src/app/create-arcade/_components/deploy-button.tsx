'use client';

import { ChainActionButton } from '@/components/chain-action-button';
import { useIdentity } from '@/components/context/identity/identity.context';
import { deployGame } from '@/server/create-arcade/deploy-game';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const ZK_CONTRACT = '036076e6bd361e99f6a6503cfbc6c2e655257f38a1';

interface Props{

}
export const DeployButton = () => {
  const router = useRouter();
  const identity = useIdentity();
  const [betAmount,setBetAmount]=useState(10);
  const [choice, setChoice]= useState<number>();
  useEffect(()=>{
    let b= Number(window.localStorage.getItem('bet_amount')||10);
    setBetAmount(b);
  },[])
  console.log("User Identity", identity);
  if (!identity) return <h6 className='text-red-600'>Please connect wallet</h6>;

  return (
    <>
     <div className='my-3 flex mx-3' style={{justifyContent:'space-around'}}>
        <div className="">
        	<Image width={100}  className={choice==1?'border-4 rounded-full':''} onClick={()=>setChoice(1)} height={100}  src="/assets/heads.png" alt="Coin's head" />
				  <span className='text-sm'>Head</span>
        </div>
        <div className="" >
					<Image width={100} className={choice==0?'border-4 rounded-full':''} onClick={()=>setChoice(0)} height={100} src="/assets/tails.png" alt="Coin's tail" />
				  <span className='text-sm'>Tail</span>
        </div>
     </div>
    <div>
    {
      choice === undefined ?<>
         <p>Select Bet Coin</p>
      </>:
      <ChainActionButton
      action={() =>deployGame(identity.address,ZK_CONTRACT,betAmount, choice)}
      onSuccess={(txHash) => {
        router.push(`/flip-coin`);
      }}
    >
      Place Bet
    </ChainActionButton>
    }
    </div>
    </>
  );
};
