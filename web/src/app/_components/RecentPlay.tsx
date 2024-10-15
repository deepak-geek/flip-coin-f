
"use client";
import { useIdentity } from '@/components/context/identity/identity.context';
import { ACTIONS } from '@/constants';
import { getTransactionsByAddress } from '@/server/game/get-game-contract-by-transaction'
import React, { useEffect, useState } from 'react'

export default function RecentPlay() {
    const [transactions, setTransactions] = useState([]);
    const identity = useIdentity();
    const url = 'https://browser.testnet.partisiablockchain.com/transactions/';
    useEffect(() => {
        getTransactions();
    }, []);

    const getTransactions = async () => {
        const transactionData = await getTransactionsByAddress('03818281bbf60e11c2e3c6172027e8b2b793df6d12');
        setTransactions(transactionData)
        console.log(transactionData)
    }
    return (
        <div id='recentPlay'>
            <div className='w-100 col-md-8 com-sm-12 border border-info  p-5 m-5'>
                <h4 className='text-center text-info mb-3 font-bold' >Recent plays</h4>
                {
                    transactions.length === 0 ?
                        <p className='text-center text-muted'>No recent plays found.</p> :
                        transactions.map((transaction: any, index) => (
                            <div key={index} className='border rounded mb-2 p-2 border-bottom'>
                                <div className='flex justify-between'>
                                    <p className='text-muted'>Transaction Hash: {transaction.node?.identifier}</p>
                                    <a className='text-muted' href={url + transaction.node?.identifier} >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right text-hover-link-primary" viewBox="0 0 16 16">
                                            <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
                                        </svg>
                                    </a>
                                </div>
                                <div className='flex justify-between'>
                                    <p className='text-info'>Action: {ACTIONS[transaction?.node?.event?.action]}</p>
                                    <p className='text-info'>Date: {new Date(+transaction?.node?.productionTime).toLocaleString()}</p>
                                </div>
                            </div>
                        ))
                }
            </div>
        </div>
    )
}