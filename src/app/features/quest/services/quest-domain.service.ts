import { Injectable } from '@angular/core';
import { Hero } from '../../hero/models/hero.model';
import { QuestResult } from '../models/quest.model';

@Injectable({
  providedIn: 'root'
})
export class QuestDomainService {

  /**
   * Calculates the outcome of a quest based on hero stats
   */
  calculateQuestOutcome(hero: Hero): QuestResult {
    const successChance = this.calculateSuccessChance(hero);
    const isSuccess = Math.random() < successChance;
    
    return {
      success: isSuccess,
      message: this.generateQuestMessage(isSuccess),
      timestamp: new Date(),
      experienceGained: isSuccess ? this.calculateExperience(hero) : Math.floor(this.calculateExperience(hero) * 0.2),
      goldGained: isSuccess ? this.calculateGoldReward(hero) : 0
    };
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
  }  /**
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

  /**
   * Determines quest difficulty level based on hero stats
   */
  getQuestDifficulty(hero: Hero): 'Easy' | 'Medium' | 'Hard' | 'Extreme' {
    const totalPower = hero.attack + hero.defense + hero.luck;
    
    if (totalPower < 20) return 'Easy';
    if (totalPower < 40) return 'Medium';
    if (totalPower < 70) return 'Hard';
    return 'Extreme';
  }

  /**
   * Validates quest parameters
   */
  validateQuestAttempt(hero: Hero): { valid: boolean; reason?: string } {
    if (hero.health <= 0) {
      return { valid: false, reason: 'Hero must have health to embark on quest' };
    }
    
    if (hero.attack <= 0 || hero.defense <= 0) {
      return { valid: false, reason: 'Hero must have positive attack and defense stats' };
    }

    return { valid: true };
  }
}
