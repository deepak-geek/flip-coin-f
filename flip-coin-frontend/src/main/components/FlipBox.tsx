import React from 'react'

interface Props{
    cost:number,
    isLogin: boolean,
    sign():void,
    win(): void
}

const FlipBox = ({cost, isLogin ,sign, win}:Props) => {
  return (
    <>
      <div className='col-md-6 mx-auto p-4'>
             <h2 className='my-4 text-info text-center'>Double or Nothing</h2>
            <div className='d-flex justify-content-center'>
                <span className='bg-warning p-5 rounded-circle me-1 cursor-pointer head-box' onClick={()=>win()}>
                    Head
                </span>
                <span  className='bg-info p-5 rounded-circle ms-1 cursor-pointer tail-box' onClick={()=>win()}>
                    Tail
                </span>
            </div>
            <div className='mt-4'>
               {
                isLogin &&  <div className='border border-info rounded p-2 d-flex justify-content-between'>
                <span className='mx-3 fs-4 text-info'>
                   {cost}
                </span>
                <span className='text-end'>
                    <button className='btn btn-sm btn-info' onClick={()=>sign()}>Matic</button>
                </span>
            </div>
               }
            </div>
      </div>
    </>
  )
}

export default FlipBox