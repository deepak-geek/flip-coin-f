import { FLIP_COIN } from '@/config';

type CommonGameSetting<T> = {
  settingId: string;
  gameType: T;
};

export type GuessTheNumberGameSetting = {
  winPoints: number;
} & CommonGameSetting<typeof FLIP_COIN.id>;


export type GameSetting = GuessTheNumberGameSetting;
