"use client"
import { GAMES } from '@/config';
import { GamePreviewCard } from './_components/game-preview-card';
import { addGame } from '@/server/create-arcade/add-game';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import RecentPlay from './_components/RecentPlay';
import HowToPlay from './_components/HowToPlay';
export default function Home() {
  
  const [betAmount, setBetAmount] = useState<string>('10');
  const [started, setStarted] = useState(false);

  const changeBetAmount=(bet:string)=>{
     setBetAmount(bet);
     localStorage.setItem('bet_amount', bet);
  }

  return (
    <>
      <div className='flex justify-center gap-4 sm:gap-12 md:gap-24 font-medium text-secondary-foreground'>
        <div className='w-1/3 text-center'>
          {GAMES.map((game) => (
            <GamePreviewCard
              key={game.title}
              game={game}
            />
          ))}
          {
            started ? <>
              <div>
                <Label htmlFor='winning-points' className='mb-2 text-white text-start'>Bet Amount</Label>
                <Input
                  type='number'
                  id='winning-points'
                  value={betAmount}
                  onChange={(e)=>changeBetAmount(e.target.value)}
                />
                <div className='text-center my-5'>
                  <Link href={'/approve'}>
                  <Button className='btn'>Approve Game</Button></Link>
                </div>
              </div>
            </> : <div className='text-center my-5'>
              <Button className='btn' onClick={() => {
                addGame(GAMES[0]);
                setStarted(true);
              }}>Start</Button>
            </div>
          }
        </div>
      </div>
      <RecentPlay />
      <HowToPlay />
    </>
  );
}
