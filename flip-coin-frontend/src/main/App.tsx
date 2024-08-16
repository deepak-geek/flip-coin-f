import React, { useState } from 'react';
import { connectMetaMaskWalletClick, connectMpcWalletClick } from './WalletIntegration';
import { CLIENT, getPetitionApi, isConnected, setAccount, setContractAddress, setPetitionApi } from './AppState';
import { sign } from './contract/PetitionGenerated';
import Navbar from './components/Navbar';
import './style.css';
import FlipBox from './components/FlipBox';
import RecentPlay from './components/RecentPlay';
import HowToPlay from './components/HowToPlay';

const App = () => {
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [address, setAddress] = useState<any>('');
  const [message, setMessage] = useState<string>('');
  const [cost, setCost] = useState<number>(0);
  const loginMetatask = async () => {
    let result: any = await connectMetaMaskWalletClick();
    console.log(result)
    if (!result?.error) {
      setIsLogin(true);
      setAddress(result?.data);
      setAccount(result?.data);
      setContractAddress(result?.data?.address);
      const accountData = await CLIENT.getAccountData(result?.data?.address);
      console.log(accountData)
    }
  }

  const sendTransaction = async () => {
    const rpc = sign();
    const cost = 300;
    console.log(rpc)
    let mainAddress = "01d9f82e98a22b319aa371e752f3e0d85bd96c9545";
    let transaction = await address?.signAndSendTransaction({ address: mainAddress, rpc }, cost);

    console.log(transaction)
  }

  const loginMpcWallet = async () => {
    let result: any = await connectMpcWalletClick();
    console.log(result)
    if (!result?.error) {
      setIsLogin(true);
      setAddress(result?.data);
      setAccount(result?.data);
      setContractAddress(result?.data?.address);
      const accountData = await CLIENT.getContractData(result?.data?.address);
      console.log(accountData)
    }
  }

  const logout = () => {
    setIsLogin(false);
    setAddress('');
    setMessage('');
    setCost(0)
  }

  const signAction = () => {
    const api = getPetitionApi();
    console.log(api)
    if (api !== undefined) {
      api
        .sign()
        .then((transactionHash) => {
          let link = `https://browser.testnet.partisiablockchain.com/transactions/${transactionHash}" target="_blank">Transaction link in browser</a>`;
          console.log(link, transactionHash)
        })
        .catch((msg) => {
          console.log(msg)
        })
    }
  }
  const winGame = async () => {
    if (!isLogin) {
      await loginMpcWallet();
    };
    setCost(2);
    setMessage("You win 2 Gas");
  }
  return (
    <div>
      <Navbar isLogin={isLogin} logout={logout} connect={loginMpcWallet} connectMPC={loginMetatask} address={address?.address} />
      <FlipBox cost={cost} isLogin={isLogin} sign={signAction} win={winGame} />
      <div className="container p-4">
        <h5 className='text-center my-4 text-white'>
          {message}
        </h5>

        <div className='d-flex justify-content-center'>
          <button disabled={!cost} className='btn btn-info' onClick={sendTransaction}>
            Double Or Nothing
          </button>
        </div>


        <RecentPlay />
        <HowToPlay />
        <div>
        </div>
      </div>
    </div>
  );
};

export default App;
