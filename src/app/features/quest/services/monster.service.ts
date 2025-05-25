import { Injectable } from '@angular/core';
import { Monster, MonsterTier, MonsterType } from '../models/monster.model';
import { MonsterConfig } from '../models/monster-data.model';
import { MONSTER_CONFIG } from '../../../../assets/data/monster-config';

@Injectable({
  providedIn: 'root'
})
export class MonsterService {
  private monsterConfig: MonsterConfig = MONSTER_CONFIG;
  
  // Cache for calculated monster difficulties to avoid repeated calculations
  private monsterDifficulties: Map<MonsterType, number> = new Map();  /**
   * Creates a random monster appropriate for hero's level
   * Uses a difficulty-based system that considers both monster base strength and tier modifiers
   * @param heroLevel Current level of the hero
   * @returns A generated monster instance
   */
  generateRandomMonster(heroLevel: number): Monster {
    // Calculate the target difficulty range for this hero level
    const targetDifficulty = this.getTargetDifficultyForLevel(heroLevel);
    const difficultyRange = this.getDifficultyRange(targetDifficulty);
    
    // Get suitable monster options within the difficulty range
    const suitableMonsters = this.getSuitableMonstersForDifficulty(difficultyRange);
    
    if (suitableMonsters.length === 0) {
      // Fallback to simple tier-based system if no suitable monsters found
      console.warn(`No suitable monsters found for hero level ${heroLevel}, falling back to tier-based selection`);
      return this.generateFallbackMonster(heroLevel);
    }
    
    // Select random monster from suitable options
    const randomMonster = suitableMonsters[Math.floor(Math.random() * suitableMonsters.length)];
    
    // Generate the monster with appropriate stats
    return this.createMonster(randomMonster.type, randomMonster.tier, heroLevel);
  }

  /**
   * Determines appropriate monster tier based on hero level
   */
  private getMonsterTierForLevel(heroLevel: number): MonsterTier {
    if (heroLevel <= 3) {
      return MonsterTier.EASY;
    } else if (heroLevel <= 6) {
      return MonsterTier.MEDIUM;
    } else if (heroLevel <= 9) {
      return MonsterTier.HARD;
    } else {
      // 10% chance of boss encounter for higher level heroes
      return Math.random() < 0.1 ? MonsterTier.BOSS : MonsterTier.HARD;
    }
  }
  /**
   * Creates a monster with appropriate stats based on type and tier
   */
  private createMonster(type: MonsterType, tier: MonsterTier, heroLevel: number): Monster {
    // Get monster data from configuration
    const monsterData = this.monsterConfig.monsters[type];
    if (!monsterData) {
      throw new Error(`Monster type ${type} not found in configuration`);
    }

    // Get tier data from configuration
    const tierData = this.monsterConfig.tiers[tier];
    if (!tierData) {
      throw new Error(`Monster tier ${tier} not found in configuration`);
    }

    // Apply tier multiplier and hero level scaling
    const levelScaling = 1 + (heroLevel * 0.1);
    const finalMultiplier = tierData.multiplier * levelScaling;    // Calculate final stats
    const health = Math.floor(monsterData.baseHealth * finalMultiplier);
    const attack = Math.floor(monsterData.baseAttack * finalMultiplier);
    const defense = Math.floor(monsterData.baseDefense * finalMultiplier);
    const experienceReward = Math.floor(monsterData.baseExpReward * finalMultiplier);
    const goldReward = Math.floor(monsterData.baseGoldReward * finalMultiplier);

    // Choose appropriate name: use tier-specific name if available, otherwise fallback to prefix + base name
    const name = monsterData.tierNames?.[tier] || (tierData.prefix + monsterData.name);

    // Return the fully configured monster
    return {
      type,
      name,
      health,
      maxHealth: health,
      attack,
      defense,
      experienceReward,
      goldReward,
      description: monsterData.description
    };
  }

  /**
   * Calculates the base difficulty of a monster type based on its stats
   * Uses a weighted formula considering health, attack, and defense
   */
  private getMonsterBaseDifficulty(type: MonsterType): number {
    if (this.monsterDifficulties.has(type)) {
      return this.monsterDifficulties.get(type)!;
    }

    const monsterData = this.monsterConfig.monsters[type];
    if (!monsterData) {
      throw new Error(`Monster type ${type} not found in configuration`);
    }

    // Calculate difficulty using weighted formula
    // Health contributes 40%, Attack 35%, Defense 25%
    const difficulty = (monsterData.baseHealth * 0.4) + 
                      (monsterData.baseAttack * 0.35) + 
                      (monsterData.baseDefense * 0.25);

    this.monsterDifficulties.set(type, difficulty);
    return difficulty;
  }

  /**
   * Calculates the effective difficulty of a monster with tier and level scaling
   */
  private getEffectiveDifficulty(type: MonsterType, tier: MonsterTier, heroLevel: number): number {
    const baseDifficulty = this.getMonsterBaseDifficulty(type);
    const tierData = this.monsterConfig.tiers[tier];
    const levelScaling = 1 + (heroLevel * 0.1);
    
    return baseDifficulty * tierData.multiplier * levelScaling;
  }

  /**
   * Determines target difficulty for a hero level
   */
  private getTargetDifficultyForLevel(heroLevel: number): number {
    // Base difficulty grows with hero level, with some variance for challenge
    const baseDifficulty = 15 + (heroLevel * 3); // Roughly scales with typical monster progression
    const variance = baseDifficulty * 0.2; // ±20% variance
    
    return baseDifficulty + (Math.random() - 0.5) * variance;
  }

  /**
   * Gets acceptable difficulty range around target
   */
  private getDifficultyRange(targetDifficulty: number): { min: number; max: number } {
    const tolerance = targetDifficulty * 0.5; // ±50% tolerance
    return {
      min: targetDifficulty - tolerance,
      max: targetDifficulty + tolerance
    };
  }

  /**
   * Finds suitable monster type/tier combinations for given difficulty range
   */
  private getSuitableMonstersForDifficulty(difficultyRange: { min: number; max: number }): Array<{ type: MonsterType; tier: MonsterTier }> {
    const suitableMonsters: Array<{ type: MonsterType; tier: MonsterTier }> = [];
    const monsterTypes = Object.values(MonsterType);
    const tierTypes = Object.values(MonsterTier);

    // Check all combinations of monster types and tiers
    for (const type of monsterTypes) {
      for (const tier of tierTypes) {
        // Use average hero level for difficulty calculation (level 5 as baseline)
        const effectiveDifficulty = this.getEffectiveDifficulty(type, tier, 5);
        
        if (effectiveDifficulty >= difficultyRange.min && effectiveDifficulty <= difficultyRange.max) {
          suitableMonsters.push({ type, tier });
        }
      }
    }

    return suitableMonsters;
  }

  /**
   * Fallback to simple tier-based generation when difficulty system fails
   */
  private generateFallbackMonster(heroLevel: number): Monster {
    const tier = this.getMonsterTierForLevel(heroLevel);
    const monsterTypes = Object.values(MonsterType);
    const randomType = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
    
    return this.createMonster(randomType, tier, heroLevel);
  }
  /**
   * Debug method to analyze monster distribution for a given hero level
   * Useful for balancing and testing the difficulty system
   */
  analyzeMonsterDistribution(heroLevel: number, sampleSize: number = 100): { [key: string]: number } {
    const distribution: { [key: string]: number } = {};
    
    for (let i = 0; i < sampleSize; i++) {
      const monster = this.generateRandomMonster(heroLevel);
      const key = monster.name; // Use the actual tier-specific name
      distribution[key] = (distribution[key] || 0) + 1;
    }
    
    // Convert to percentages and sort by frequency
    const sorted = Object.entries(distribution)
      .map(([name, count]) => ({ name, percentage: (count / sampleSize * 100).toFixed(1) }))
      .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
    
    const result: { [key: string]: number } = {};
    sorted.forEach(item => {
      result[item.name] = parseFloat(item.percentage);
    });
    
    return result;
  }
}
