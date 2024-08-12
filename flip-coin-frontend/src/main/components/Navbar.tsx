import React from 'react'
import { scrollToView } from '../utils'

interface Props {
    isLogin: boolean,
    address: string,
    logout(): void,
    connect(): void,
    connectMPC(): void
}
const Navbar = ({ isLogin,address, logout, connect, connectMPC }: Props) => {
    return (
        <nav className="navbar navbar-expand-lg bg-transparent text-white">
            <div className="container-fluid">
                <span className="navbar-brand text-info" >Coin FLP</span>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarText">
                    <ul className="nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <a className="nav-link text-info" href="#" onClick={()=>scrollToView('howToPlay')}>How To Play</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link text-info" href="#"  onClick={()=>scrollToView('recentPlay')}>Recent</a>
                        </li>
                    </ul>
                    <span className="navbar-text">
                        {
                            isLogin ? <>
                                <span className='text-white mx-2'>* * * * {address ? address.slice(36,42):''}</span>
                                <button className='btn btn-info' onClick={logout}>Logout</button>
                            </> : <>
                                <button className='btn btn-info me-2' onClick={connectMPC}>Connect MPC Wallet</button>
                                <button className='btn btn-info me-2' onClick={connect}>Connect Party Wallet</button>
                            </>
                        }
                    </span>
                </div>
            </div>
        </nav>
    )
}

export default Navbar