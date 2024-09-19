'use client';

import { ChainActionButton } from '@/components/chain-action-button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useGuessTheNumberActions } from '@/lib/game-actions/actions.hook';
import { useEffect, useState } from 'react';
import { AdminActionBox } from './admin-action-box';
import { useCanGameStart } from './use-can-game-start';
import Coin from '@/app/_components/Coin';

const MAX_NUMBER = 255;
export const GuessTheNumberAdmin = () => {
  const [side, setSide]= useState('');
  const actions = useGuessTheNumberActions();
  const canGameStart = useCanGameStart();

  return (
    <AdminActionBox>
      <div className=' w-full items-center space-y-5 text-sm font-semibold'>
        <div>The game will start when the coin is fliped.</div>

        <Label htmlFor='secret-number'>Side: {side||'NA'}</Label>
        <Coin side={side} />   
        <ChainActionButton
          action={() =>{
           setSide('loading');
           return actions.secretNumberInput(1)
          }}
        //  disabled={!canGameStart}
        >
          Start
        </ChainActionButton>
        {/* {!canGameStart && (
          <div className='text-red-900'>
            Need more players to start the game.
          </div>
        )} */}
      </div>
    </AdminActionBox>
  );
};
