import { Injectable } from '@angular/core';
import { Hero } from '../models/hero.model';

@Injectable({
  providedIn: 'root'
})
export class HeroDomainService {
  /**
   * Calculates the total power of a hero based on their stats
   */
  calculateTotalPower(hero: Hero): number {
    return hero.health + hero.attack + hero.defense + hero.luck;
  }
  /**
   * Calculates hero's level based on experience using a scaling formula
   * Level increases get progressively harder to reach
   * @param experience Total accumulated experience
   * @returns Current level based on experience
   */
  calculateLevel(experience: number): number {
    // Make higher levels require exponentially more XP
    // Base formula: level = 1 + sqrt(experience / 50)
    return Math.floor(1 + Math.sqrt(experience / 50));
  }

  /**
   * Calculates total experience needed to reach a specific level
   * @param level Target level
   * @returns Experience required for that level
   */
  getExperienceForLevel(level: number): number {
    // Inversion of the level calculation formula
    // experience = 50 * (level - 1)²
    return 50 * Math.pow(level - 1, 2);
  }

  /**
   * Calculates experience required for the next level from current experience
   * @param currentExperience Current experience total
   * @returns Experience points needed to reach next level
   */
  getExperienceForNextLevel(currentExperience: number): number {
    const currentLevel = this.calculateLevel(currentExperience);
    const nextLevel = currentLevel + 1;
    const expNeededForNextLevel = this.getExperienceForLevel(nextLevel);
    return expNeededForNextLevel - currentExperience;
  }

  /**
   * Determines if hero can level up based on old and new experience values
   * @param oldExperience Experience before gain
   * @param newExperience Experience after gain
   * @returns True if level has increased
   */
  canLevelUp(oldExperience: number, newExperience: number): boolean {
    const oldLevel = this.calculateLevel(oldExperience);
    const newLevel = this.calculateLevel(newExperience);
    return newLevel > oldLevel;
  }
  /**
   * Applies stat increases when hero levels up
   * @param hero Hero to level up
   * @param levels Number of levels gained
   * @returns Updated hero with improved stats
   */ levelUpHero(hero: Hero, levels: number = 1): Hero {
    let updatedHero = { ...hero };

    // Apply stat increases for each level gained
    for (let i = 0; i < levels; i++) {
      const healthIncrease = 20;
      updatedHero = {
        ...updatedHero,
        health: updatedHero.health + healthIncrease,
        maxHealth: updatedHero.maxHealth + healthIncrease,
        attack: updatedHero.attack + 3,
        defense: updatedHero.defense + 2,
        speed: updatedHero.speed + 1,
        luck: updatedHero.luck + 1
      };
    }

    return updatedHero;
  }

  /**
   * Calculates what a hero's stats should be at a specific level
   * Uses the same level-up progression logic to determine final stats
   * @param baseStats Starting stats at level 1
   * @param targetLevel Level to calculate stats for
   * @returns Hero stats as they would be at the target level
   */
  calculateStatsForLevel(baseStats: Omit<Hero, 'name' | 'level' | 'experience'>, targetLevel: number): Omit<Hero, 'name' | 'level' | 'experience'> {
    if (targetLevel < 1) {
      throw new Error('Level must be 1 or greater');
    }

    // Start with base stats
    let currentStats = { ...baseStats };

    // Apply level-up increases for each level beyond 1
    const levelsToGain = targetLevel - 1;
    if (levelsToGain > 0) {
      // Apply the same stat increases as levelUpHero method
      const healthIncrease = 20 * levelsToGain;
      currentStats = {
        ...currentStats,
        health: currentStats.health + healthIncrease,
        maxHealth: currentStats.maxHealth + healthIncrease,
        attack: currentStats.attack + (3 * levelsToGain),
        defense: currentStats.defense + (2 * levelsToGain),
        speed: currentStats.speed + (1 * levelsToGain),
        luck: currentStats.luck + (1 * levelsToGain)
      };
    }

    return currentStats;
  }

  /**
   * Validates hero stats are within acceptable ranges
   */
  validateHeroStats(hero: Hero): boolean {
    return (
      hero.health > 0 &&
      hero.attack > 0 &&
      hero.defense > 0 &&
      hero.luck >= 0 &&
      hero.health <= 1000 &&
      hero.attack <= 100 &&
      hero.defense <= 100 &&
      hero.luck <= 50
    );
  }
}
