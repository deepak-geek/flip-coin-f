'use client';

import { ChainActionButton } from '@/components/chain-action-button';
import { useIdentity } from '@/components/context/identity/identity.context';
import { flipCoinGame} from '@/server/create-arcade/deploy-game';
import { useRouter } from 'next/navigation';

const ZK_CONTRACT = '032ff610b96c5cf1e8077d6b34560456f4f23a7f3d';

export const FlipCoinButton = () => {
  const router = useRouter();
  const identity = useIdentity();
  console.log("User Identity", identity);
  if (!identity) return <h6 className='text-red-600'>Please connect wallet</h6>;
  return (
    <ChainActionButton
      action={() =>flipCoinGame(identity.address,ZK_CONTRACT)}
      onSuccess={(txHash) => {
        router.push(`/winner`);
      }}
    >
      Flip Coin
    </ChainActionButton>
  );
};
