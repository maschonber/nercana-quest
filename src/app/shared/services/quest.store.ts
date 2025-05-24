import { Injectable, inject } from '@angular/core';
import { signalStore, withState, withMethods } from '@ngrx/signals';
import { patchState, getState } from '@ngrx/signals';
import { Hero } from '../../features/hero/models/hero.model';
import { LogEntry } from '../../models/log-entry.model';
import { QuestDomainService } from '../../features/quest/services/quest-domain.service';
import { HeroDomainService } from '../../features/hero/services/hero-domain.service';
import { QuestStep } from '../../features/quest/models/quest.model';
import { Monster } from '../../features/quest/models/monster.model';
import { CombatResult } from '../../features/quest/models/combat.model';

interface QuestState {
  hero: Hero;
  log: LogEntry[];
  questInProgress: boolean;
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
  log: [],
  questInProgress: false
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
        
        // Don't start a new quest if one is already in progress
        if (currentState.questInProgress) {
          return;
        }
        
        const hero = currentState.hero;
        
        // Use domain service to calculate quest outcome with multiple steps
        const questResult = questDomainService.calculateQuestOutcome(hero);
        
        // Mark quest as in progress
        patchState(store, {
          questInProgress: true
        });
        
        // Process quest steps with a delay between each
        this.processQuestSteps(questResult.steps, 0, hero);
      },
      
      /**
       * Processes quest steps sequentially with a delay
       */
      processQuestSteps(steps: QuestStep[], currentIndex: number, originalHero: Hero) {
        if (currentIndex >= steps.length) {
          // All steps completed, mark quest as finished
          patchState(store, {
            questInProgress: false
          });
          return;
        }
        
        const currentStep = steps[currentIndex];
        const currentState = getState(store);          // Create log entry for the current step
        const logEntry: LogEntry = {
          message: currentStep.message,
          timestamp: new Date(),
          success: currentStep.success,
          stepType: currentStep.type,
          experienceGained: currentStep.experienceGained,
          goldGained: currentStep.goldGained,
          monster: currentStep.monster,
          combatResult: currentStep.combatResult
        };
        
        // Apply any rewards from this step
        const updatedHero = { ...currentState.hero };
        let levelUpMessage = '';
        
        // If the step provides experience
        if (currentStep.experienceGained > 0) {
          const oldExperience = updatedHero.experience;
          const newExperience = oldExperience + currentStep.experienceGained;
          
          updatedHero.experience = newExperience;
          
          // Check if hero can level up
          if (heroDomainService.canLevelUp(oldExperience, newExperience)) {
            // Calculate old and new levels
            const oldLevel = heroDomainService.calculateLevel(oldExperience);
            const newLevel = heroDomainService.calculateLevel(newExperience);
            const levelsGained = newLevel - oldLevel;
            
            // Apply stat increases for all levels gained
            const leveledHero = heroDomainService.levelUpHero(updatedHero, levelsGained);
            
            // Update hero with new stats and level
            updatedHero.health = leveledHero.health;
            updatedHero.attack = leveledHero.attack;
            updatedHero.defense = leveledHero.defense;
            updatedHero.luck = leveledHero.luck;
            updatedHero.level = newLevel;
            
            // Create level up message
            levelUpMessage = levelsGained === 1 
              ? ' You gained a level!' 
              : ` You gained ${levelsGained} levels!`;
          }
        }
        
        // If the step provides gold
        if (currentStep.goldGained > 0) {
          updatedHero.gold += currentStep.goldGained;
        }
        
        // Add level up message if applicable
        if (levelUpMessage) {
          logEntry.message += levelUpMessage;
        }
        
        // Update the store with the new log entry and updated hero
        patchState(store, {
          hero: updatedHero,
          log: [logEntry, ...currentState.log]
        });
        
        // Process the next step after a delay
        setTimeout(() => {
          this.processQuestSteps(steps, currentIndex + 1, originalHero);
        }, 500); // 500ms delay between steps
      }
    };
  })
) {}
