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
   * Calculates hero's level based on experience
   */
  calculateLevel(experience: number): number {
    return Math.floor(experience / 100) + 1;
  }

  /**
   * Calculates experience needed for next level
   */
  getExperienceForNextLevel(currentExperience: number): number {
    const currentLevel = this.calculateLevel(currentExperience);
    return currentLevel * 100;
  }  /**
   * Determines if hero can level up
   */
  canLevelUp(currentExperience: number): boolean {
    // Experience levels: 0-99=Level1, 100-199=Level2, 200-299=Level3, etc.
    // Can level up at exactly 100, 200, 300, etc.
    return currentExperience > 0 && currentExperience % 100 === 0;
  }

  /**
   * Applies stat increases when hero levels up
   */
  levelUpHero(hero: Hero): Hero {
    return {
      ...hero,
      health: hero.health + 5,
      attack: hero.attack + 2,
      defense: hero.defense + 2,
      luck: hero.luck + 1
    };
  }

  /**
   * Validates hero stats are within acceptable ranges
   */
  validateHeroStats(hero: Hero): boolean {
    return hero.health > 0 && 
           hero.attack > 0 && 
           hero.defense > 0 && 
           hero.luck >= 0 &&
           hero.health <= 1000 &&
           hero.attack <= 100 &&
           hero.defense <= 100 &&
           hero.luck <= 50;
  }
}
