import { useGameState } from '@/components/context/game-state.context';
import { useGamemasterAbi } from '@/components/context/gamemaster.context';
import { useIdentity } from '@/components/context/identity/identity.context';
import { GuessTheNumberActions } from './guess-the-number-actions';

export const useGuessTheNumberActions = () => {
  const address = useIdentity()?.address;
  const abi = useGamemasterAbi();
  const { contractId, engineKeys } = useGameState();

  return new GuessTheNumberActions(contractId, address, abi, engineKeys);
};
