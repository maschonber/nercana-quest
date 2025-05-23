import { Injectable } from '@angular/core';
import { signalStore, withState, withMethods } from '@ngrx/signals';
import { patchState, getState } from '@ngrx/signals';
import { Hero } from '../models/hero.model';
import { LogEntry } from '../models/log-entry.model';

interface QuestState {
  hero: Hero;
  log: LogEntry[];
}

const initialState: QuestState = {
  hero: {
    name: 'Adventurer',
    health: 100,
    attack: 12,
    defense: 8,
    luck: 5
  },
  log: []
};

@Injectable({ providedIn: 'root' })
export class QuestStore extends signalStore(
  withState<QuestState>(initialState),
  withMethods((store) => ({
    embarkOnQuest() {
      const hero = getState(store).hero;
      const roll = Math.random();
      const success = roll < (0.5 + hero.luck * 0.05);
      const message = success
        ? 'Quest succeeded! Your hero returns victorious.'
        : 'Quest failed. Your hero barely escapes!';
      
      patchState(store, {
        log: [
          {
            message,
            timestamp: new Date(),
            success
          },
          ...getState(store).log
        ]
      });
    }
  }))
) {}
