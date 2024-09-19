'use server';

import { Game } from '@/config';
import { nanoid } from 'nanoid';
import { getStorage, setStorage } from './storage';
import { GameSetting } from './types';

const DEFAULTS = {
  GUESS_THE_NUMBER: {
    WIN_POINTS: 10,
  }
};

const makeSetting = (game: Game): GameSetting => {
  const settingId = nanoid();

  if (game.id === 'flip-coin') {
    return {
      settingId,
      gameType: game.id,
      winPoints: DEFAULTS.GUESS_THE_NUMBER.WIN_POINTS,
    };
  }
  throw new Error('Invalid game type');
};

export const addGame = async (game: Game) => {
  const settings = getStorage();

  const newSettings = [...settings, makeSetting(game)];

  setStorage(newSettings);
};
