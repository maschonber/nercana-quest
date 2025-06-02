import { Injectable } from '@angular/core';
import { CombatService } from '../../combat/services/combat.service';
import { HeroDomainService } from '../../hero/services/hero-domain.service';
import { MonsterService } from '../../quest/services/monster.service';
import { Hero } from '../../hero/models/hero.model';
import {
  Monster,
  MonsterType,
  MonsterTier
} from '../../quest/models/monster.model';
import {
  SimulationConfig,
  SimulationResults,
  SimulationRun,
  SimulationStatistics,
  TemplateHero,
  TEMPLATE_HEROES,
  MonsterSelection
} from '../models/simulation.model';
import { CombatOutcome } from '../../combat/models/combat.model';

@Injectable({
  providedIn: 'root'
})
export class CombatSimulatorService {
  constructor(
    private combatService: CombatService,
    private heroDomainService: HeroDomainService,
    private monsterService: MonsterService
  ) {}

  /**
   * Get available template heroes for simulation
   */
  getTemplateHeroes(): TemplateHero[] {
    return TEMPLATE_HEROES;
  }

  /**
   * Create a hero at a specific level using template
   */
  createHeroAtLevel(template: TemplateHero, level: number): Hero {
    if (level < 1 || level > 20) {
      throw new Error('Hero level must be between 1 and 20');
    }

    // Start with base stats at level 1
    let hero: Hero = {
      name: template.name,
      level: 1,
      experience: this.heroDomainService.getExperienceForLevel(1),
      ...template.baseStats
    };

    // Level up to target level
    if (level > 1) {
      const levelsToGain = level - 1;
      hero = this.heroDomainService.levelUpHero(hero, levelsToGain);
      hero.level = level;
      hero.experience = this.heroDomainService.getExperienceForLevel(level);
    }

    return hero;
  }

  /**
   * Get all available monster types with their display names
   */
  getAvailableMonsters(): MonsterSelection[] {
    const monsters: MonsterSelection[] = [];

    // Get all monster types and create selections for each tier
    const monsterTypes = Object.values(MonsterType);
    const tiers = Object.values(MonsterTier);

    for (const type of monsterTypes) {
      for (const tier of tiers) {
        try {
          const monster = this.monsterService.createMonsterForSimulation(
            type,
            tier
          );
          monsters.push({
            type,
            tier,
            name: monster.name
          });
        } catch (error) {
          // Skip invalid combinations
          console.warn(`Invalid monster combination: ${type} at ${tier} tier`);
        }
      }
    }

    return monsters;
  }
  /**
   * Create a monster from selection
   */
  createMonsterFromSelection(selection: MonsterSelection): Monster {
    return this.monsterService.createMonsterForSimulation(
      selection.type,
      selection.tier
    );
  }

  /**
   * Run combat simulation with given configuration
   */
  async runSimulation(config: SimulationConfig): Promise<SimulationResults> {
    const results: SimulationResults = {
      config,
      runs: [],
      statistics: this.initializeStatistics(),
      startTime: new Date()
    };

    // Run the specified number of combats
    for (let i = 1; i <= config.runCount; i++) {
      const combatResult = this.combatService.createTeamCombat(
        config.heroTeam,
        config.enemyTeam
      );

      const run: SimulationRun = {
        runNumber: i,
        combatResult,
        timestamp: new Date()
      };

      results.runs.push(run);

      // Update statistics
      this.updateStatistics(results.statistics, combatResult);

      // Allow UI to update for long simulations
      if (i % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    results.endTime = new Date();
    this.finalizeStatistics(results.statistics, config.runCount);

    return results;
  }

  /**
   * Initialize statistics object
   */
  private initializeStatistics(): SimulationStatistics {
    return {
      totalRuns: 0,
      heroVictories: 0,
      heroDefeats: 0,
      heroFlees: 0,
      heroWinPercentage: 0,
      enemyWinPercentage: 0,
      fleePercentage: 0,
      averageTurns: 0,
      averageExperience: 0
    };
  }

  /**
   * Update statistics with combat result
   */
  private updateStatistics(
    stats: SimulationStatistics,
    combatResult: any
  ): void {
    stats.totalRuns++;

    switch (combatResult.outcome) {
      case CombatOutcome.HERO_VICTORY:
        stats.heroVictories++;
        break;
      case CombatOutcome.HERO_DEFEAT:
        stats.heroDefeats++;
        break;
      case CombatOutcome.HERO_FLED:
        stats.heroFlees++;
        break;
    }

    // Accumulate turn count and experience for averaging
    stats.averageTurns += combatResult.turns.length;
    stats.averageExperience += combatResult.experienceGained;
  }

  /**
   * Finalize statistics calculations
   */
  private finalizeStatistics(
    stats: SimulationStatistics,
    totalRuns: number
  ): void {
    // Calculate percentages
    stats.heroWinPercentage = (stats.heroVictories / totalRuns) * 100;
    stats.enemyWinPercentage = (stats.heroDefeats / totalRuns) * 100;
    stats.fleePercentage = (stats.heroFlees / totalRuns) * 100;

    // Calculate averages
    stats.averageTurns = stats.averageTurns / totalRuns;
    stats.averageExperience = stats.averageExperience / totalRuns;
  }

  /**
   * Validate simulation configuration
   */
  validateConfiguration(config: SimulationConfig): string[] {
    const errors: string[] = [];

    if (config.heroTeam.length === 0) {
      errors.push('At least one hero must be selected');
    }

    if (config.heroTeam.length > 3) {
      errors.push('Maximum 3 heroes allowed');
    }

    if (config.enemyTeam.length === 0) {
      errors.push('At least one enemy must be selected');
    }

    if (config.enemyTeam.length > 3) {
      errors.push('Maximum 3 enemies allowed');
    }

    if (config.runCount < 1 || config.runCount > 100) {
      errors.push('Run count must be between 1 and 100');
    }

    return errors;
  }
}
