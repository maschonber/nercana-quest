import { inject } from '@angular/core';
import { signalStore, withState, withMethods } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';
import { QuestDomainService, QuestContext } from '../../features/quest/services/quest-domain.service';
import { QuestStep, QuestStepType } from '../../features/quest/models/quest.model';
import { LogEntry } from '../../models/log-entry.model';
import { Hero } from '../../features/hero/models/hero.model';
import { HeroStore } from './hero.store';
import { HeroFacadeService } from '../../features/hero/services/hero-facade.service';
import { LogStore } from './log.store';

interface QuestState {
  questInProgress: boolean;
  questContext: QuestContext | null;
}

const initialState: QuestState = {
  questInProgress: false,
  questContext: null
};

export const QuestStore = signalStore(
  { providedIn: 'root' },
  withState<QuestState>(initialState),
  withMethods((store) => {
    const questDomainService = inject(QuestDomainService);
    const heroStore = inject(HeroStore);
    const heroFacade = inject(HeroFacadeService);
    const logStore = inject(LogStore);
    
    return {      /**
       * Starts a new quest adventure with dynamic step generation
       */
      embarkOnQuest(): void {
        // Don't start a new quest if one is already in progress
        if (store.questInProgress()) {
          return;
        }
        
        const hero = heroStore.hero();
        
        // Create quest context for dynamic step generation
        const questContext = questDomainService.createQuestContext(hero);
        
        // Mark quest as in progress and store context
        patchState(store, { 
          questInProgress: true,
          questContext: questContext
        });
        
        // Process first quest step
        this.processNextQuestStep();
      },
      
      /**
       * Processes the next quest step dynamically using current hero state
       */
      processNextQuestStep(): void {
        const context = store.questContext();
        
        if (!context) {
          console.error('No quest context found');
          return;
        }
        
        // Generate next step with current hero state
        const currentHero = heroFacade.hero();
        const nextStep = questDomainService.generateNextStep(currentHero, context);
        
        if (!nextStep) {
          // All steps completed, mark quest as finished
          patchState(store, { 
            questInProgress: false,
            questContext: null
          });
          return;
        }
          // Apply combat health changes for encounter steps
        if (nextStep.type === QuestStepType.ENCOUNTER && nextStep.combatResult) {
          // Calculate health damage from combat
          const initialHeroHealth = currentHero.health;
          const combatFinalHealth = nextStep.combatResult.turns.length > 0 
            ? nextStep.combatResult.turns[nextStep.combatResult.turns.length - 1].heroHealthAfter
            : initialHeroHealth;
            // Set health directly to the combat result value
          heroFacade.setHealth(combatFinalHealth);
        }
        
        // Create log entry for the current step
        let logEntry: LogEntry = {
          message: nextStep.message,
          timestamp: new Date(),
          success: nextStep.success,
          stepType: nextStep.type,
          experienceGained: nextStep.experienceGained,
          goldGained: nextStep.goldGained,
          monster: nextStep.monster,
          combatResult: nextStep.combatResult
        };        // Apply rewards from this step
        let levelUpMessage = '';
        
        if (nextStep.experienceGained > 0) {
          levelUpMessage = heroStore.addExperience(nextStep.experienceGained);
        }
        
        if (nextStep.goldGained > 0) {
          heroStore.addGold(nextStep.goldGained);
        }
        
        // Add level up message if applicable
        if (levelUpMessage) {
          logEntry.message += levelUpMessage;
        }
        
        // Add log entry
        logStore.addEntry(logEntry);
          // Update quest context in store
        patchState(store, { questContext: context });
        
        // Process the next step after a delay
        setTimeout(() => {
          this.processNextQuestStep();
        }, 500); // 500ms delay between steps
      }
    };
  })
);
