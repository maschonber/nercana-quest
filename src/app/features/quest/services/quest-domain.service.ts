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
  /** Current quest status - starts as ongoing, changes based on encounters */
  questStatus: 'ongoing' | 'successful' | 'failed';
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
    
    // Generate step types without pre-determining success
    const stepTypes = this.generateStepTypes(stepCount);
    
    // Count encounters and treasures
    const encounterCount = stepTypes.filter(type => type === QuestStepType.ENCOUNTER).length;
    const treasureCount = stepTypes.filter(type => type === QuestStepType.TREASURE).length;
    
    // Calculate base rewards
    const baseExperience = this.calculateExperience(hero);
    const baseTreasureGold = this.calculateGoldReward(hero);
    
    return {
      remainingStepTypes: [...stepTypes],
      questStatus: 'ongoing',
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
    if (context.remainingStepTypes.length === 0 || context.questStatus !== 'ongoing') {
      return null; // No more steps or quest already ended
    }
    
    const stepType = context.remainingStepTypes.shift()!;
    
    const step = this.createQuestStep(
      stepType,
      hero, // Use current hero state with updated health
      context.questStatus,
      context.currentStepIndex,
      context.totalSteps,
      context.baseExperience,
      context.baseTreasureGold,
      context.encounterCount,
      context.treasureCount
    );
    
    // Update context for next step
    context.currentStepIndex++;
    
    // If hero was defeated in combat, mark quest as failed and end immediately
    if (step.type === QuestStepType.ENCOUNTER && 
        step.combatResult && 
        step.combatResult.outcome === CombatOutcome.HERO_DEFEAT) {
      context.questStatus = 'failed';
      // Clear remaining steps since quest ends here
      context.remainingStepTypes = [];
    } else if (context.remainingStepTypes.length === 0) {
      // All steps completed successfully
      context.questStatus = 'successful';
    }
    
    return step;
  }
    /**
   * Generates step types for a quest
   */
  private generateStepTypes(stepCount: number): QuestStepType[] {
    const stepTypes: QuestStepType[] = [];
    
    for (let i = 0; i < stepCount; i++) {
      const roll = Math.random();
      let stepType: QuestStepType;
      
      if (roll < 0.4) {
        stepType = QuestStepType.EXPLORATION;
      } else if (roll < 0.8) {
        stepType = QuestStepType.ENCOUNTER;
      } else {
        stepType = QuestStepType.TREASURE;
      }
      
      stepTypes.push(stepType);
    }
    
    // Ensure at least one treasure step in every quest for potential rewards
    const hasTreasure = stepTypes.some(type => type === QuestStepType.TREASURE);
    if (!hasTreasure) {
      // Replace the last exploration with treasure
      for (let i = stepTypes.length - 1; i >= 0; i--) {
        if (stepTypes[i] === QuestStepType.EXPLORATION) {
          stepTypes[i] = QuestStepType.TREASURE;
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
    questStatus: 'ongoing' | 'successful' | 'failed', 
    stepIndex: number, 
    totalSteps: number,
    baseExperience: number,
    baseTreasureGold: number,
    encounterCount: number,
    treasureCount: number
  ): QuestStep {
    // Default values
    let message = '';
    let success = true; // Individual step success (different from overall quest status)
    let experienceGained = 0;
    let goldGained = 0;
    let monster = undefined;
    let combatResult = undefined;
    
    switch(type) {
      case QuestStepType.EXPLORATION:
        message = this.generateExplorationMessage();
        // Exploration steps always succeed individually
        success = true;
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
        message = this.generateTreasureMessage();
        // Treasure steps provide rewards based on quest still being ongoing
        if (questStatus === 'ongoing') {
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
  private generateExplorationMessage(): string {
    const messages = [
      'Your hero explores a forgotten ruin, discovering ancient inscriptions.',
      'A hidden forest path reveals beautiful scenery and rare plants.',
      'Your hero scales a tall cliff, gaining a breathtaking view of the land.',
      'An abandoned mineshaft holds mysteries from a bygone era.',
      'Your hero encounters dense fog, making navigation challenging.',
      'The swampy terrain requires careful navigation.',
      'A sudden rainstorm forces your hero to seek temporary shelter.',
      'Your hero discovers an interesting landmark along the journey.'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
    /**
   * Generates message for treasure step
   */
  private generateTreasureMessage(): string {
    const messages = [
      'Your hero discovers a hidden chest filled with gold!',
      'Ancient coins and gems are recovered from a forgotten vault!',
      'Your hero finds valuable artifacts hidden in the ruins!',
      'A grateful merchant rewards your hero with treasure!',
      'Your hero uncovers a small cache of valuable items.',
      'A hidden compartment reveals some coins and trinkets.',
      'Your hero finds a few valuable gems among the rubble.',
      'Some interesting artifacts are discovered along the way.'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }/**
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
