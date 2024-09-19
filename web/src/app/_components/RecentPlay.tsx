import React from 'react'

const RecentPlay = () => {
  return (
    <div id='recentPlay'>
        <div className='w-100 col-md-8 com-sm-12 border border-info  p-5 m-5'>
             <h4 className='text-center text-info mb-3' >Recent plays</h4>
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
        </div>
    </div>
  )
}

export default RecentPlay