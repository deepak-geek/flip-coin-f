'use client';

import { ChainActionButton } from '@/components/chain-action-button';
import { useIdentity } from '@/components/context/identity/identity.context';
import { deployGame } from '@/server/create-arcade/deploy-game';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Props {

}
export const RecentTransaction = () => {
  const router = useRouter();
  const identity = useIdentity();
  const [betAmount, setBetAmount] = useState(10);
  const [choice, setChoice] = useState<number>();
  useEffect(() => {
    let b = Number(window.localStorage.getItem('bet_amount') || 10);
    setBetAmount(b);
  }, [])
  console.log("User Identity", identity);
  if (!identity) return "";

  return (
    <>
      <div className='text-white '>
        <div className='border-bottom d-flex justify-content-between px-2 mb-1'>
          <span>Wallet #fddgfdgfdg</span>
          <span>
            17 day ago
          </span>
        </div>
        <div className='border-bottom d-flex justify-content-between px-2 mb-1'>
          <span>Wallet #fddg34324234</span>
          <span>
            17 day ago
          </span>
        </div>
        <div className='border-bottom d-flex justify-content-between px-2 mb-1'>
          <span>Wallet #fd324234gfdg</span>
          <span>
            17 day ago
          </span>
        </div>
      </div>
    </>
  );
};
