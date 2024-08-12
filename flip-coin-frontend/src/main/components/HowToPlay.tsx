import React from 'react';

const HowToPlay = () => {
    return (
        <div className='p-4' id='howToPlay'>
            <div className='d-flex flex-wrap'>
                <div className='col-md-5 col-sm-12'>
                    <img className='w-100' src={'https://smartcontract.life/wp-content/uploads/2018/10/mobile-crypto.png'} alt="" height={400} />
                </div>
                <div className='col-md-7 col-sm-12'>
                    <div>
                        <h4 className='text-info'>How To Play</h4>
                        <p className='text-white'>Shine Coin Flip is a smart contract that allows users to play Double or Nothing with their Polygon tokens.
                        </p>
                        <ol className='text-white'>
                            <li>Connect your Party Wallet.</li>
                            <li>Pick either heads or tails.</li>
                            <li>Select your desired flip amount.</li>
                            <li>Click "Double or Nothing".</li>
                            <li>Click approve and wait for coin to spin.</li>
                            <li>Congrats.</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HowToPlay