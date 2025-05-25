import { Injectable, inject } from '@angular/core';
import { Hero } from '../../hero/models/hero.model';
import { QuestResult, QuestStep, QuestStepType } from '../models/quest.model';
import { CombatOutcome, CombatResult } from '../models/combat.model';
import { MonsterService } from './monster.service';
import { CombatService } from './combat.service';

/**
 * Context for tracking quest progress during dynamic step generation
 */
export interface QuestContext {
  /** Remaining step types to be generated */
  remainingStepTypes: QuestStepType[];
  /** Overall quest success prediction */
  questSuccess: boolean;
  /** Base experience reward for treasure steps */
  baseExperience: number;
  /** Base gold reward for treasure steps */
  baseTreasureGold: number;
  /** Total number of encounter steps planned */
  encounterCount: number;
  /** Total number of treasure steps planned */
  treasureCount: number;
  /** Current step index */
  currentStepIndex: number;
  /** Total number of steps in the quest */
  totalSteps: number;
}

@Injectable({
  providedIn: 'root'
})
export class QuestDomainService {
  private readonly monsterService = inject(MonsterService);
  private readonly combatService = inject(CombatService);
  
  /**
   * Creates initial quest context for dynamic step generation
   */
  createQuestContext(hero: Hero): QuestContext {
    const stepCount = Math.floor(Math.random() * 4) + 2; // 2-5 steps
    
    // Determine overall quest success first
    const successChance = this.calculateSuccessChance(hero);
    const questSuccess = Math.random() < successChance;
    
    // Generate step types
    const stepTypes = this.generateStepTypes(stepCount, questSuccess);
    
    // Count encounters and treasures
    const encounterCount = stepTypes.filter(type => type === QuestStepType.ENCOUNTER).length;
    const treasureCount = stepTypes.filter(type => type === QuestStepType.TREASURE).length;
    
    // Calculate base rewards
    const baseExperience = this.calculateExperience(hero);
    const baseTreasureGold = this.calculateGoldReward(hero);
    
    return {
      remainingStepTypes: [...stepTypes],
      questSuccess,
      baseExperience,
      baseTreasureGold,
      encounterCount,
      treasureCount,
      currentStepIndex: 0,
      totalSteps: stepCount
    };
  }
  
  /**
   * Generates the next quest step using current hero state
   */
  generateNextStep(hero: Hero, context: QuestContext): QuestStep | null {
    if (context.remainingStepTypes.length === 0) {
      return null; // No more steps
    }
    
    const stepType = context.remainingStepTypes.shift()!;
    
    const step = this.createQuestStep(
      stepType,
      hero, // Use current hero state with updated health
      context.questSuccess,
      context.currentStepIndex,
      context.totalSteps,
      context.baseExperience,
      context.baseTreasureGold,
      context.encounterCount,
      context.treasureCount
    );
    
    // Update context for next step
    context.currentStepIndex++;
    
    // If hero was defeated in combat, mark quest as failed
    if (step.type === QuestStepType.ENCOUNTER && 
        step.combatResult && 
        step.combatResult.outcome === CombatOutcome.HERO_DEFEAT) {
      context.questSuccess = false;
    }
    
    return step;
  }
  
  /**
   * Generates step types for a quest
   */
  private generateStepTypes(stepCount: number, questSuccess: boolean): QuestStepType[] {
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
    
    return stepTypes;
  }
    /**
   * Creates a quest step of a specific type with appropriate rewards
   */  private createQuestStep(
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
    let monster = undefined;
    let combatResult = undefined;
    
    switch(type) {
      case QuestStepType.EXPLORATION:
        message = this.generateExplorationMessage(questSuccess);
        // Exploration steps don't affect quest success and provide no rewards
        success = true; // Always "succeed" at exploration even if quest fails
        break;
        
      case QuestStepType.ENCOUNTER:
        // Generate a monster appropriate for the hero's level
        monster = this.monsterService.generateRandomMonster(hero.level);
        
        // Clone hero to avoid modifying the original during combat simulation
        const heroCopy = { ...hero };
        
        // Simulate combat between hero and monster
        combatResult = this.combatService.simulateCombat(heroCopy, monster);
        
        // Determine success based on combat outcome
        success = combatResult.outcome === CombatOutcome.HERO_VICTORY;
        
        // Set rewards from combat (already scaled appropriately)
        experienceGained = combatResult.experienceGained;
        goldGained = combatResult.goldGained;        // Generate appropriate message based on combat outcome
        message = this.generateEncounterMessageFromCombat(combatResult, monster);
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
      goldGained,
      monster,
      combatResult
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
  }  /**
   * Generates message for encounter step based on combat result
   */
  private generateEncounterMessageFromCombat(combatResult: CombatResult, monster?: any): string {
    const monsterName = monster?.name || "the enemy";
    
    switch (combatResult.outcome) {
      case CombatOutcome.HERO_VICTORY:        const victoryMessages = [
          `Your hero defeated ${monsterName} after an intense battle! ${combatResult.summary}`,
          `${monsterName} was no match for your hero's combat prowess after a ${combatResult.turns.length}-turn fight!`,
          `Victory! Your hero vanquished ${monsterName} with superior tactics!`,
          `After a fierce struggle, your hero emerged victorious over ${monsterName}!`
        ];
        return victoryMessages[Math.floor(Math.random() * victoryMessages.length)];
        
      case CombatOutcome.HERO_DEFEAT:
        const defeatMessages = [
          `Your hero was overwhelmed by ${monsterName} but managed to escape with their life.`,
          `Despite a valiant effort against ${monsterName}, your hero was forced to retreat after being wounded.`,
          `${monsterName} proved too powerful, leaving your hero no choice but to withdraw from the battle.`,
          `Your hero suffered defeat at the hands of ${monsterName} but lived to fight another day.`
        ];
        return defeatMessages[Math.floor(Math.random() * defeatMessages.length)];
        
      case CombatOutcome.HERO_FLED:
        const fleeMessages = [
          `Your hero made a tactical retreat when facing ${monsterName}, judging the odds unfavorable.`,
          `Recognizing the danger posed by ${monsterName}, your hero wisely chose to flee the battle.`,
          `Your hero managed to escape from a potentially deadly encounter with ${monsterName}.`,
          `Facing ${monsterName}, your hero decided that discretion was the better part of valor.`
        ];
        return fleeMessages[Math.floor(Math.random() * fleeMessages.length)];
        
      default:
        return `Your hero encountered ${monsterName}, but the outcome is unclear.`;
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
