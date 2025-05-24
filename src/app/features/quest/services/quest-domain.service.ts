import { Injectable } from '@angular/core';
import { Hero } from '../../hero/models/hero.model';
import { QuestResult, QuestStep, QuestStepType } from '../models/quest.model';

@Injectable({
  providedIn: 'root'
})
export class QuestDomainService {
  /**
   * Calculates the outcome of a quest based on hero stats,
   * generating 2-5 quest steps of different types
   */
  calculateQuestOutcome(hero: Hero): QuestResult {
    const stepCount = Math.floor(Math.random() * 4) + 2; // 2-5 steps
    const steps: QuestStep[] = [];
    
    // Determine overall quest success first
    const successChance = this.calculateSuccessChance(hero);
    const isSuccess = Math.random() < successChance;
    
    // Generate steps with individual rewards
    this.generateQuestSteps(hero, stepCount, isSuccess, steps);
    
    // Calculate total rewards from all steps
    const totalExperience = steps.reduce((sum, step) => sum + step.experienceGained, 0);
    const totalGold = steps.reduce((sum, step) => sum + step.goldGained, 0);
    
    return {
      success: isSuccess,
      message: this.generateQuestMessage(isSuccess),
      timestamp: new Date(),
      experienceGained: totalExperience,
      goldGained: totalGold,
      steps: steps
    };
  }
  /**
   * Generates a specific number of quest steps with individual rewards
   */
  private generateQuestSteps(
    hero: Hero, 
    stepCount: number, 
    questSuccess: boolean, 
    steps: QuestStep[]
  ): void {
    // Count encounters for experience distribution
    let encounterCount = 0;
    let treasureCount = 0;
    
    // First pass: determine step types and count encounters/treasures
    const stepTypes: QuestStepType[] = [];
    for (let i = 0; i < stepCount; i++) {
      let stepType: QuestStepType;
      
      const roll = Math.random();
      if (roll < 0.4) {
        stepType = QuestStepType.EXPLORATION;
      } else if (roll < 0.8) {
        stepType = QuestStepType.ENCOUNTER;
        encounterCount++;
      } else {
        stepType = QuestStepType.TREASURE;
        treasureCount++;
      }
      
      stepTypes.push(stepType);
    }
    
    // Ensure at least one treasure for successful quests
    if (questSuccess && treasureCount === 0) {
      // Replace the last exploration with treasure
      for (let i = stepTypes.length - 1; i >= 0; i--) {
        if (stepTypes[i] === QuestStepType.EXPLORATION) {
          stepTypes[i] = QuestStepType.TREASURE;
          treasureCount++;
          break;
        }
      }
    }
    
    // Calculate base rewards
    const baseExperience = this.calculateExperience(hero);
    const baseTreasureGold = this.calculateGoldReward(hero);
    
    // Second pass: create steps with appropriate rewards
    for (let i = 0; i < stepCount; i++) {
      steps.push(this.createQuestStep(
        stepTypes[i], 
        hero, 
        questSuccess, 
        i, 
        stepCount,
        baseExperience,
        baseTreasureGold,
        encounterCount,
        treasureCount
      ));
    }
  }
    /**
   * Creates a quest step of a specific type with appropriate rewards
   */
  private createQuestStep(
    type: QuestStepType, 
    hero: Hero, 
    questSuccess: boolean, 
    stepIndex: number, 
    totalSteps: number,
    baseExperience: number,
    baseTreasureGold: number,
    encounterCount: number,
    treasureCount: number
  ): QuestStep {
    // Default values
    let message = '';
    let success = questSuccess;
    let experienceGained = 0;
    let goldGained = 0;
    
    switch(type) {
      case QuestStepType.EXPLORATION:
        message = this.generateExplorationMessage(questSuccess);
        // Exploration steps don't affect quest success and provide no rewards
        success = true; // Always "succeed" at exploration even if quest fails
        break;
        
      case QuestStepType.ENCOUNTER:
        message = this.generateEncounterMessage(questSuccess);
        
        // Experience from successful encounters
        if (questSuccess) {
          // Distribute experience across all encounters
          experienceGained = Math.floor(baseExperience / Math.max(1, encounterCount));
        } else {
          // Failed encounters give reduced experience (learning from failure)
          experienceGained = Math.floor((baseExperience * 0.2) / Math.max(1, encounterCount));
        }
        
        // Minor gold from encounters (successful ones)
        if (questSuccess) {
          goldGained = Math.floor(baseTreasureGold * 0.15); // 15% of treasure gold
        }
        break;
        
      case QuestStepType.TREASURE:
        message = this.generateTreasureMessage(questSuccess);
        // Major gold from treasures (only when successful)
        if (questSuccess) {
          goldGained = Math.floor(baseTreasureGold / Math.max(1, treasureCount));
        }
        break;
    }
    
    return {
      type,
      message,
      success,
      timestamp: new Date(),
      experienceGained,
      goldGained
    };
  }
  
  /**
   * Generates message for exploration step
   */
  private generateExplorationMessage(questSuccess: boolean): string {
    if (questSuccess) {
      const messages = [
        'Your hero explores a forgotten ruin, discovering ancient inscriptions.',
        'A hidden forest path reveals beautiful scenery and rare plants.',
        'Your hero scales a tall cliff, gaining a breathtaking view of the land.',
        'An abandoned mineshaft holds mysteries from a bygone era.'
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    } else {
      const messages = [
        'Your hero encounters dense fog, making navigation difficult.',
        'The swampy terrain slows your hero\'s progress considerably.',
        'A sudden rainstorm forces your hero to seek shelter temporarily.',
        'Your hero takes a wrong turn, losing valuable time.'
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
  }
  
  /**
   * Generates message for encounter step
   */
  private generateEncounterMessage(questSuccess: boolean): string {
    if (questSuccess) {
      const messages = [
        'Your hero defeats a band of goblins threatening a trade route!',
        'A territorial troll is no match for your hero\'s combat skills!',
        'Your hero outsmarts a cunning sphinx guarding a passage!',
        'A pack of wild beasts is driven away by your hero\'s prowess!'
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    } else {
      const messages = [
        'Your hero is forced to retreat from overwhelming enemy forces!',
        'A powerful enchanted creature proves too strong to defeat!',        'Your hero barely escapes an ambush by skilled bandits!',
        'The dark magic wielder\'s spells force your hero to fall back!'
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
  }
  
  /**
   * Generates message for treasure step
   */
  private generateTreasureMessage(questSuccess: boolean): string {
    if (questSuccess) {
      const messages = [
        'Your hero discovers a hidden chest filled with gold!',
        'Ancient coins and gems are recovered from a forgotten vault!',
        'Your hero is rewarded handsomely for completing the task!',
        'A grateful merchant rewards your hero with a bag of gold!'
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    } else {
      const messages = [
        'The rumored treasure turns out to be nothing but fool\'s gold.',
        'Your hero finds the treasure chamber empty, looted long ago.',
        'The promised reward is withheld due to the quest\'s failure.',
        'Your hero must leave valuable loot behind during the hasty retreat.'
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
  }

  /**
   * Calculates quest success chance based on hero stats
   */
  private calculateSuccessChance(hero: Hero): number {
    const totalPower = hero.attack + hero.defense + hero.luck;
    const baseChance = 0.3; // 30% base success rate
    const powerBonus = Math.min(0.6, totalPower / 100); // Up to 60% bonus based on stats
    
    return Math.min(0.95, baseChance + powerBonus); // Cap at 95% success rate
  }

  /**
   * Generates appropriate quest message based on outcome
   */
  private generateQuestMessage(success: boolean): string {
    if (success) {
      const successMessages = [
        'Quest succeeded! Your hero returns victorious.',
        'Your hero emerges triumphant from the dangerous quest!',
        'Victory! The quest has been completed successfully.',
        'Your hero overcomes all obstacles and succeeds!'
      ];
      return successMessages[Math.floor(Math.random() * successMessages.length)];
    } else {
      const failureMessages = [
        'Quest failed. Your hero barely escapes!',
        'The quest proves too dangerous. Your hero retreats.',
        'Despite valiant efforts, the quest ends in failure.',
        'Your hero is forced to abandon the quest.'
      ];
      return failureMessages[Math.floor(Math.random() * failureMessages.length)];
    }
  }
  
  /**
   * Calculates experience gained from quest
   * Experience scales with hero level and stats
   */
  private calculateExperience(hero: Hero): number {
    const baseExperience = 10;
    
    // Increase base XP with level to ensure progression
    const levelScaling = 1 + (hero.level * 0.2);
    
    // Bonus from hero stats
    const statMultiplier = 1 + (hero.attack + hero.defense) / 50;
    
    // Final calculation with randomness for variety
    const varianceFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
    
    return Math.floor(baseExperience * levelScaling * statMultiplier * varianceFactor);
  }

  /**
   * Calculates gold reward from successful quest
   * Gold rewards scale with hero level and luck
   */
  private calculateGoldReward(hero: Hero): number {
    const baseGold = 5;
    
    // Increase base gold with level
    const levelBonus = hero.level * 2;
    
    // Luck affects gold found
    const luckMultiplier = 1 + hero.luck / 20;
    
    // Add randomness
    const varianceFactor = 0.9 + (Math.random() * 0.3); // 0.9 to 1.2
    
    return Math.floor((baseGold + levelBonus) * luckMultiplier * varianceFactor);
  }
}
