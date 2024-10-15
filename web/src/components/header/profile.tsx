import { fetchIdentity } from '@/server/user/cookie-auth';
import { CircleUserRound, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { FC } from 'react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ConnectWallet } from '../wallet/connect-wallet';
import { DropdownMenuItemLogout } from './dropdown-menu-item-logout';
import { DropdownMenuItemSettings } from './dropdown-menu-item-settings';
import { getCurrentUserState } from '@/server/game/get-game-contract-by-transaction';

export const Profile: FC = async () => {
  const user = await fetchIdentity();

  if (!user) {
    return <ConnectWallet />;
  }
  const { account } = await getCurrentUserState(user?.address);
  return (
    <div className='flex items-center gap-2'>
      <span className='flex'>
        <DollarSign /> 
       {account?.mpc20Balances.find((m:any)=>m?.symbol=='TD')?.balance|| 0}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost'>
            <CircleUserRound className='text-muted-foreground' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='mr-5'>
          <p className='text-sm text-center my-2'>****{user.address.slice(36,42)}</p>
          <DropdownMenuItemSettings />
          <DropdownMenuItemLogout />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
