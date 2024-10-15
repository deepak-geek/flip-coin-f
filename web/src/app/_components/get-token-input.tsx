"use client";
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'

const GetTokenInput = () => {
  const [betAmount, setBetAmount] = useState<string>('');
  
  const changeBetAmount=(bet:string)=>{
       setBetAmount(bet);
       localStorage.setItem('amount', bet);
  }
  return (
    <Input
    type='number'
    id='winning-points'
    value={betAmount}
    style={{color:'black'}}
    onChange={(e)=>changeBetAmount(e.target.value)}
  />
  )
}

export default GetTokenInput