import { inject } from '@angular/core';
import { signalStore, withState, withMethods } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';
import { QuestDomainService } from '../../features/quest/services/quest-domain.service';
import { QuestStep } from '../../features/quest/models/quest.model';
import { LogEntry } from '../../models/log-entry.model';
import { Hero } from '../../features/hero/models/hero.model';
import { HeroStore } from './hero.store';
import { LogStore } from './log.store';

interface QuestState {
  questInProgress: boolean;
}

const initialState: QuestState = {
  questInProgress: false
};

export const QuestStore = signalStore(
  { providedIn: 'root' },
  withState<QuestState>(initialState),
  withMethods((store) => {
    const questDomainService = inject(QuestDomainService);
    const heroStore = inject(HeroStore);
    const logStore = inject(LogStore);
    
    return {
      /**
       * Starts a new quest adventure
       */
      embarkOnQuest(): void {
        // Don't start a new quest if one is already in progress
        if (store.questInProgress()) {
          return;
        }
        
        const hero = heroStore.hero();
        
        // Use domain service to calculate quest outcome with multiple steps
        const questResult = questDomainService.calculateQuestOutcome(hero);
        
        // Mark quest as in progress
        patchState(store, { questInProgress: true });
        
        // Process quest steps with a delay between each
        this.processQuestSteps(questResult.steps, 0);
      },
      
      /**
       * Processes quest steps sequentially with a delay
       */
      processQuestSteps(steps: QuestStep[], currentIndex: number): void {
        if (currentIndex >= steps.length) {
          // All steps completed, mark quest as finished
          patchState(store, { questInProgress: false });
          return;
        }
        
        const currentStep = steps[currentIndex];
        
        // Create log entry for the current step
        let logEntry: LogEntry = {
          message: currentStep.message,
          timestamp: new Date(),
          success: currentStep.success,
          stepType: currentStep.type,
          experienceGained: currentStep.experienceGained,
          goldGained: currentStep.goldGained,
          monster: currentStep.monster,
          combatResult: currentStep.combatResult
        };
        
        // Apply rewards from this step
        let levelUpMessage = '';
        
        if (currentStep.experienceGained > 0) {
          levelUpMessage = heroStore.addExperience(currentStep.experienceGained);
        }
        
        if (currentStep.goldGained > 0) {
          heroStore.addGold(currentStep.goldGained);
        }
          // Add level up message if applicable
        if (levelUpMessage) {
          logEntry.message += levelUpMessage;
        }
        
        // Add log entry
        logStore.addEntry(logEntry);
        
        // Process the next step after a delay
        setTimeout(() => {
          this.processQuestSteps(steps, currentIndex + 1);
        }, 500); // 500ms delay between steps
      }
    };
  })
);
