import { Injectable, inject } from '@angular/core';
import { signalStore, withState, withMethods } from '@ngrx/signals';
import { patchState, getState } from '@ngrx/signals';
import { Hero } from '../features/hero/models/hero.model';
import { LogEntry } from '../models/log-entry.model';
import { QuestDomainService } from '../features/quest/services/quest-domain.service';
import { HeroDomainService } from '../features/hero/services/hero-domain.service';

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
    luck: 5,
    level: 1,
    experience: 0,
    gold: 0
  },
  log: []
};

@Injectable({ providedIn: 'root' })
export class QuestStore extends signalStore(
  withState<QuestState>(initialState),
  withMethods((store) => {
    const questDomainService = inject(QuestDomainService);
    const heroDomainService = inject(HeroDomainService);
      return {
      embarkOnQuest() {
        const currentState = getState(store);
        const hero = currentState.hero;
        
        // Use domain service to calculate quest outcome
        const questResult = questDomainService.calculateQuestOutcome(hero);
        
        // Update hero with gained experience and gold
        const updatedHero = {
          ...hero,
          experience: hero.experience + questResult.experienceGained,
          gold: hero.gold + questResult.goldGained
        };
        
        // Check if hero can level up
        if (heroDomainService.canLevelUp(updatedHero.experience)) {
          const leveledHero = heroDomainService.levelUpHero(updatedHero);
          updatedHero.level = heroDomainService.calculateLevel(updatedHero.experience);
          updatedHero.health = leveledHero.health;
          updatedHero.attack = leveledHero.attack;
          updatedHero.defense = leveledHero.defense;
          updatedHero.luck = leveledHero.luck;
        }
        
        // Create log entry using the quest result
        const logEntry: LogEntry = {
          message: questResult.message,
          timestamp: new Date(),
          success: questResult.success
        };
        
        patchState(store, {
          hero: updatedHero,
          log: [logEntry, ...currentState.log]
        });
      }
    };
  })
) {}
