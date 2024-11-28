'use client';

import { ChainActionButton } from '@/components/chain-action-button';
import { useIdentity } from '@/components/context/identity/identity.context';
import { flipCoinGame} from '@/server/create-arcade/deploy-game';
import { getGameContractByTransaction } from '@/server/game/get-game-contract-by-transaction';
import { useRouter } from 'next/navigation';

const ZK_CONTRACT = '03daafab238ef480e4dabe7588ac0839e0649b6c32';

export const FlipCoinButton = () => {
  const router = useRouter();
  const identity = useIdentity();
  console.log("User Identity", identity);
  if (!identity) return <h6 className='text-red-600'>Please connect wallet</h6>;
  return (
    <ChainActionButton
      action={() =>flipCoinGame(identity.address,ZK_CONTRACT)}
      onSuccess={async (txHash) => {
        const result = await getGameContractByTransaction(txHash);
        console.log("Game Contract", result);
        router.push(`/winner`);
      }}
    >
      Flip Coin
    </ChainActionButton>
  );
};
