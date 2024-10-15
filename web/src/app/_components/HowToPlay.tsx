import Image from 'next/image';
import React from 'react';

const HowToPlay = () => {
    return (
        <div className='p-4 mt-5' id='howToPlay'>
            <div className='flex flex-wrap'>
                <div className='w-2/5'>
                    <Image className='w-100' src={'/assets/wallets.png'} alt="" width={400} height={400} />
                </div>
                <div className='w-3/5'>
                    <div>
                        <h4 className='text-info font-bold text-2xl'>How To Play</h4>
                        <p className='text-white py-2'>Shine Coin Flip is a smart contract that allows users to play Double or Nothing with their Polygon tokens.
                        </p>
                        <ol className='text-white'>
                            <li className='my-3'>Connect your Party Wallet.</li>
                            <li>Pick either heads or tails.</li>
                            <li  className='my-3'>Select your desired flip amount.</li>
                            <li>Click &qout;Double or Nothing&qout;.</li>
                            <li  className='my-3'>Click approve and wait for coin to spin.</li>
                            <li>Congrats.</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HowToPlay