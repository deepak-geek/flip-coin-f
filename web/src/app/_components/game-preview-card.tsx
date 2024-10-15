import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Game } from '@/config';
import Image from 'next/image';
import { FC } from 'react';

type Props = {
  game: Game;
};

export const GamePreviewCard: FC<Props> = ({ game }) => {
  const { title, description } = game;

  return (
    <button className='group mx-auto'>
      <Card className='group: flex bg-primary-foreground transition-all hover:bg-primary hover:text-primary-foreground'>
        <Image
          className='shrink grow-0 rounded'
          src={`/assets/games/${game.id}.webp`}
          alt={''}
          width={128}
          height={128}
        />
        <CardHeader className='w-full'>
          <CardTitle className='text-center mb-3'>{title}</CardTitle>
          <CardDescription className='group-hover:text-muted text-xs'>
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </button>
  );
};
