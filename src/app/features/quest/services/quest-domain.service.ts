import { Injectable, inject } from '@angular/core';
import { Hero } from '../../hero/models/hero.model';
import { QuestResult, QuestStep, QuestStepType } from '../models/quest.model';
import { CombatOutcome, CombatResult } from '../models/combat.model';
import { MonsterService } from './monster.service';
import { CombatService } from './combat.service';  /**
   * Context for tracking quest progress during dynamic step generation
   */
  export interface QuestContext {
    /** Remaining step types to be generated */
    remainingStepTypes: QuestStepType[];
    /** Current quest status - starts as ongoing, changes based on encounters */
    questStatus: 'ongoing' | 'successful' | 'failed';
    /** Current step index */
    currentStepIndex: number;
    /** Accumulated resources that will be awarded only on quest success */
    accumulatedGoo: number;
    accumulatedMetal: number;
  }

@Injectable({
  providedIn: 'root'
})
export class QuestDomainService {
  private readonly monsterService = inject(MonsterService);
  private readonly combatService = inject(CombatService);
  /**
   * Creates initial quest context for dynamic step generation
   */  createQuestContext(hero: Hero): QuestContext {
    const stepCount = Math.floor(Math.random() * 4) + 2; // 2-5 steps
    
    // Generate step types without pre-determining success
    const stepTypes = this.generateStepTypes(stepCount);
    
    return {
      remainingStepTypes: [...stepTypes],
      questStatus: 'ongoing',
      currentStepIndex: 0,
      accumulatedGoo: 0,
      accumulatedMetal: 0
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
      context
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
      
      if (roll < 0.5) {
        stepType = QuestStepType.EXPLORATION;
      } else if (roll < 0.9) {
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
  }  /**
   * Creates a quest step of a specific type with appropriate rewards
   */  private createQuestStep(
    type: QuestStepType, 
    hero: Hero, 
    context: QuestContext  ): QuestStep {// Default values
    let message = '';
    let success = true; // Individual step success (different from overall quest status)
    let experienceGained = 0;
    let gooGained = 0;
    let metalGained = 0;
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
        
        // Simulate combat between hero and monster using new team combat API
        combatResult = this.combatService.createTeamCombat([heroCopy], [monster]);
        
        // Determine success based on combat outcome
        success = combatResult.outcome === CombatOutcome.HERO_VICTORY;
        
        // Set rewards from combat (already scaled appropriately)
        experienceGained = combatResult.experienceGained;        // Accumulate goo from encounters (only on success)
        if (success) {
          gooGained = this.calculateGooFromEncounter(hero, monster);
          context.accumulatedGoo += gooGained;
        }
        
        // Generate appropriate message based on combat outcome
        message = this.generateEncounterMessageFromCombat(combatResult, monster);
        break;
        
      case QuestStepType.TREASURE:
        message = this.generateTreasureMessage();
        // Treasure steps always succeed
        success = true;
        
        // Accumulate metal from treasure
        metalGained = this.calculateMetalFromTreasure(hero);        context.accumulatedMetal += metalGained;
        break;
    }    return {
      type,
      message,
      success,
      timestamp: new Date(),
      experienceGained,
      gooGained: gooGained > 0 ? gooGained : undefined,
      metalGained: metalGained > 0 ? metalGained : undefined,
      monster,
      combatResult
    };
  }  /**
   * Generates message for exploration step
   */
  private generateExplorationMessage(): string {
    const messages = [
      'Your clone scans an abandoned station sector, discovering valuable data logs.',
      'A maintenance corridor reveals hidden passages and interesting machinery.',
      'Your clone accesses an observation deck, gaining a view of the nebula.',
      'An abandoned cargo bay holds mysteries from previous station operations.',
      'Your clone encounters sensor interference, making navigation challenging.',
      'The zero-gravity sectors require careful maneuvering through debris.',
      'A sudden system malfunction forces your clone to find an alternate route.',
      'Your clone discovers an interesting piece of station infrastructure.'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
  /**
   * Generates message for treasure step
   */
  private generateTreasureMessage(): string {
    const messages = [
      'Your clone discovers a salvage cache filled with valuable tech parts!',
      'Ancient data cores and metal scraps are recovered from a storage compartment!',
      'Your clone finds valuable equipment hidden in the maintenance bay!',
      'A grateful station AI rewards your clone with useful components!',
      'Your clone uncovers a small stash of valuable salvage.',
      'A hidden panel reveals some tech parts and metal fragments.',
      'Your clone finds a few energy cells among the station debris.',
      'Some interesting components are discovered along the way.'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }/**
   * Generates message for encounter step based on combat result
   */
  private generateEncounterMessageFromCombat(combatResult: CombatResult, monster?: any): string {
    const monsterName = monster?.name || "the hostile entity";
    
    switch (combatResult.outcome) {
      case CombatOutcome.HERO_VICTORY:
        const victoryMessages = [
          `Your clone defeated ${monsterName} after an intense firefight! ${combatResult.summary}`,
          `${monsterName} was no match for your clone's tactical prowess after a ${combatResult.turns.length}-turn engagement!`,
          `Victory! Your clone neutralized ${monsterName} with superior technology!`,
          `After a fierce struggle, your clone emerged victorious over ${monsterName}!`
        ];
        return victoryMessages[Math.floor(Math.random() * victoryMessages.length)];
          case CombatOutcome.HERO_DEFEAT:
        const defeatMessages = [
          `Your clone was destroyed by ${monsterName} in a devastating firefight. Clone termination confirmed.`,
          `Despite valiant resistance, ${monsterName} eliminated your clone with overwhelming force. Time for a new clone.`,
          `${monsterName} proved too powerful - your clone didn't survive the encounter. Mission failure, clone lost.`,
          `Fatal encounter: Your clone was killed by ${monsterName}. Emergency clone replacement protocols are advised.`
        ];
        return defeatMessages[Math.floor(Math.random() * defeatMessages.length)];
        
      case CombatOutcome.HERO_FLED:
        const fleeMessages = [
          `Your clone made a tactical retreat when facing ${monsterName}, judging the odds unfavorable.`,
          `Recognizing the threat posed by ${monsterName}, your clone cowardly chose to disengage from combat.`,
          `Your clone managed to escape from a potentially deadly encounter with ${monsterName}.`,
          `Facing ${monsterName}, your clone foolishly decided to put its own safety above the mission.`
        ];
        return fleeMessages[Math.floor(Math.random() * fleeMessages.length)];
        
      default:
        return `Your clone encountered ${monsterName}, but the outcome is unclear.`;
    }  }

  /**
   * Calculates goo gained from defeating a monster in an encounter
   * Now primarily based on the effective difficulty of the defeated monster
   */  private calculateGooFromEncounter(hero: Hero, monster: any): number {
    if (!monster) {
      // Fallback to old calculation if no monster provided
      const baseGoo = 1;
      const levelMultiplier = 1 + (hero.level * 0.1);
      const varianceFactor = 0.8 + (Math.random() * 0.4);
      return Math.floor((baseGoo + Math.random() * 2) * levelMultiplier * varianceFactor);
    }

    // Calculate the effective difficulty using the centralized method from MonsterService
    const effectiveDifficulty = this.monsterService.calculateMonsterInstanceDifficulty(monster);
    
    // Safety check: if difficulty is undefined or NaN, calculate a fallback
    const safeDifficulty = (effectiveDifficulty != null && !isNaN(effectiveDifficulty)) 
      ? effectiveDifficulty 
      : this.calculateFallbackDifficulty(monster);
    
    // Base goo calculation primarily from monster difficulty
    // Use a scaling factor to convert difficulty to reasonable goo amounts
    const difficultyScalingFactor = 0.15; // Adjust this to balance goo rewards
    const baseGooFromDifficulty = safeDifficulty * difficultyScalingFactor;
    
    // Small level bonus (much less influential than before)
    const levelBonus = hero.level * 0.1;
    
    // Reduced variance to make rewards more predictable
    const varianceFactor = 0.9 + (Math.random() * 0.2); // 0.9 to 1.1 (reduced from 0.8-1.2)
    
    // Final calculation with minimum of 1 goo
    const finalGoo = Math.max(1, Math.floor((baseGooFromDifficulty + levelBonus) * varianceFactor));
    return finalGoo;
  }

  /**
   * Fallback difficulty calculation when MonsterService method fails
   */
  private calculateFallbackDifficulty(monster: any): number {
    if (!monster) {
      return 10; // Default difficulty
    }
    
    // Use the same weighted formula as MonsterService
    // Health contributes 40%, Attack 35%, Defense 25%
    const difficulty = (monster.maxHealth * 0.4) + 
                      (monster.attack * 0.35) + 
                      (monster.defense * 0.25);

    return difficulty || 10; // Return 10 if calculation results in 0/NaN
  }

  /**
   * Calculates metal gained from a treasure step
   */
  private calculateMetalFromTreasure(hero: Hero): number {
    const baseMetal = 2;
    const levelMultiplier = 1 + (hero.level * 0.1);
    const varianceFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
    
    return Math.floor((baseMetal + Math.random() * 3) * levelMultiplier * varianceFactor); // 2-5 metal
  }

  /**
   * Creates a quest result with accumulated resources (only awarded on success)
   */
  createQuestResult(context: QuestContext, steps: QuestStep[]): QuestResult {
    let message = '';
    let totalExperience = 0;
    let gooGained = 0;
    let metalGained = 0;

    // Calculate total experience from all steps
    totalExperience = steps.reduce((total, step) => total + step.experienceGained, 0);

    // Set message based on quest outcome
    switch (context.questStatus) {
      case 'successful':
        message = 'Quest completed successfully! Your clone has returned with valuable resources.';
        // Award accumulated resources only on success
        gooGained = context.accumulatedGoo;
        metalGained = context.accumulatedMetal;
        break;
      case 'failed':
        message = 'Quest failed! Your clone was lost, and any gathered resources were abandoned.';
        // No resources awarded on failure
        gooGained = 0;
        metalGained = 0;
        break;
      default:
        message = 'Quest is ongoing...';
        gooGained = 0;
        metalGained = 0;
        break;
    }

    return {
      questStatus: context.questStatus,
      message,
      timestamp: new Date(),
      experienceGained: totalExperience,
      gooGained,
      metalGained,
      steps
    };
  }

}
