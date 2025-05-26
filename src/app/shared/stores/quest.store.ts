import { inject } from '@angular/core';
import { signalStore, withState, withMethods } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';
import { QuestDomainService, QuestContext } from '../../features/quest/services/quest-domain.service';
import { QuestStep, QuestStepType } from '../../features/quest/models/quest.model';
import { LogEntry } from '../../models/log-entry.model';
import { Hero } from '../../features/hero/models/hero.model';
import { HeroStore } from './hero.store';
import { HeroFacadeService } from '../../features/hero/services/hero-facade.service';
import { StationFacadeService } from '../services/station-facade.service';
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
  withMethods((store) => {    const questDomainService = inject(QuestDomainService);
    const heroStore = inject(HeroStore);
    const heroFacade = inject(HeroFacadeService);
    const stationFacade = inject(StationFacadeService);
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
          // All steps completed, finalize quest
          this.finalizeQuest(context);
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
        }        // Create log entry for the current step
        let logEntry: LogEntry = {
          message: nextStep.message,
          timestamp: new Date(),
          success: nextStep.success,
          stepType: nextStep.type,
          experienceGained: nextStep.experienceGained,
          monster: nextStep.monster,
          monsters: nextStep.monsters,
          combatResult: nextStep.combatResult,
          gooGained: nextStep.gooGained,
          metalGained: nextStep.metalGained
        };// Apply rewards from this step
        let levelUpMessage = '';
        
        if (nextStep.experienceGained > 0) {
          levelUpMessage = heroStore.addExperience(nextStep.experienceGained);
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
      },

      /**
       * Finalizes the quest and awards accumulated resources on success
       */
    finalizeQuest(context: QuestContext): void {
        // Get quest steps from the log entries created during the quest
        const recentEntries = logStore.entries().filter(entry => 
          entry.stepType === 'exploration' || 
          entry.stepType === 'encounter' || 
          entry.stepType === 'treasure'
        );        // Convert log entries to quest steps for the result
        const steps: QuestStep[] = recentEntries.map(entry => ({
          type: entry.stepType as QuestStepType,
          message: entry.message,
          timestamp: entry.timestamp,
          success: entry.success,
          experienceGained: entry.experienceGained || 0,
          monster: entry.monster,
          monsters: entry.monsters,
          combatResult: entry.combatResult,
          gooGained: entry.gooGained,
          metalGained: entry.metalGained
        }));
        
        const questResult = questDomainService.createQuestResult(context, steps);

        // Award resources only if quest was successful
        if (questResult.questStatus === 'successful') {
          if (questResult.gooGained && questResult.gooGained > 0) {
            stationFacade.addGoo(questResult.gooGained, 'Quest completion reward');
          }
          
          if (questResult.metalGained && questResult.metalGained > 0) {
            stationFacade.addMetal(questResult.metalGained, 'Quest completion reward');
          }
        }        // Create final log entry for quest completion
        const finalLogEntry: LogEntry = {
          message: questResult.message,
          timestamp: new Date(),
          success: questResult.questStatus === 'successful',
          stepType: QuestStepType.QUEST_COMPLETE,
          experienceGained: 0 // Experience was already awarded per step
        };

        logStore.addEntry(finalLogEntry);

        // Mark quest as finished
        patchState(store, { 
          questInProgress: false,
          questContext: null
        });
      }
    };
  })
);
