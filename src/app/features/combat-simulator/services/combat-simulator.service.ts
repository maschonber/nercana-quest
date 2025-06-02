import { Injectable, inject } from '@angular/core';
import { CombatService } from '../../combat/services/combat.service';
import { Hero } from '../../hero/models/hero.model';
import { Monster, MonsterType, MonsterTier } from '../../quest/models/monster.model';
import { MonsterService } from '../../quest/services/monster.service';
import {
  SimulationConfig,
  SimulationResults,
  SimulationRun,
  SimulationStatistics,
  TemplateHero,
  MonsterSelection,
  TEMPLATE_HEROES
} from '../models/simulation.model';
import {
  MultiSimulationConfig,
  MultiSimulationResults,
  MonsterComparisonResult
} from '../models/multi-simulation.model';
import { CombatOutcome, CombatantType } from '../../combat/models/combat.model';

@Injectable({
  providedIn: 'root'
})
export class CombatSimulatorService {
  constructor(
    private combatService: CombatService,
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

    // Scale stats based on level (simple linear scaling for simulation)
    const scalingFactor = 1 + (level - 1) * 0.1; // 10% increase per level
    
    const hero: Hero = {
      name: template.name,
      level: level,
      experience: level * 100, // Simple experience calculation
      health: Math.floor(template.baseStats.health * scalingFactor),
      maxHealth: Math.floor(template.baseStats.maxHealth * scalingFactor),
      attack: Math.floor(template.baseStats.attack * scalingFactor),
      defense: Math.floor(template.baseStats.defense * scalingFactor),
      speed: Math.floor(template.baseStats.speed * scalingFactor),
      luck: Math.floor(template.baseStats.luck * scalingFactor)
    };

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

  /**
   * Validate multi-simulation configuration
   */
  validateMultiSimulationConfiguration(config: MultiSimulationConfig): string[] {
    const errors: string[] = [];

    if (config.heroTeam.length === 0) {
      errors.push('At least one hero must be selected');
    }

    if (config.heroTeam.length > 3) {
      errors.push('Maximum 3 heroes allowed');
    }

    if (config.runCount < 1 || config.runCount > 100) {
      errors.push('Run count must be between 1 and 100');
    }

    return errors;
  }

  /**
   * Run multi-simulation against all available monsters
   */
  async runMultiSimulation(config: MultiSimulationConfig): Promise<MultiSimulationResults> {
    const results: MultiSimulationResults = {
      config,
      monsterResults: [],
      startTime: new Date()
    };

    // Get all available monsters
    const allMonsters = this.getAvailableMonsters();
    const totalMonsters = allMonsters.length;

    // Run simulation against each monster
    for (let i = 0; i < allMonsters.length; i++) {
      const monsterSelection = allMonsters[i];
      const monsterInstance = this.createMonsterFromSelection(monsterSelection);
      
      // Create simulation config for this monster
      const singleSimConfig: SimulationConfig = {
        heroTeam: config.heroTeam,
        enemyTeam: [monsterInstance],
        runCount: config.runCount
      };

      // Run simulation against this monster
      const simResults = await this.runSimulation(singleSimConfig);
      
      // Calculate additional metrics
      const averageHealthLost = this.calculateAverageHealthLost(simResults, config.heroTeam);
      const difficulty = this.monsterService.calculateMonsterInstanceDifficulty(monsterInstance);
      
      // Create monster comparison result
      const monsterResult: MonsterComparisonResult = {
        monster: monsterSelection,
        monsterInstance,
        runs: simResults.runs,
        statistics: simResults.statistics,
        averageHealthLost,
        difficulty
      };

      results.monsterResults.push(monsterResult);

      // Allow UI to update progress
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    results.endTime = new Date();
    return results;
  }

  /**
   * Calculate average health lost by heroes during combat
   */  private calculateAverageHealthLost(simResults: SimulationResults, heroTeam: Hero[]): number {
    let totalHealthLost = 0;
    let validRuns = 0;

    for (const run of simResults.runs) {
      if (run.combatResult.outcome !== CombatOutcome.HERO_FLED && run.combatResult.turns.length > 0) {
        // Sum initial health of all heroes
        const initialHealth = heroTeam.reduce((sum, hero) => sum + hero.maxHealth, 0);
        
        // Get final health from the last turn
        const lastTurn = run.combatResult.turns[run.combatResult.turns.length - 1];
        let finalHealth = 0;
        
        if (lastTurn.allCombatantsHealth) {
          // Use comprehensive health tracking if available
          finalHealth = lastTurn.allCombatantsHealth
            .filter(combatant => combatant.type === CombatantType.HERO)
            .reduce((sum, hero) => sum + hero.health, 0);
        } else {
          // Fall back to legacy heroHealthAfter field for single hero
          finalHealth = lastTurn.heroHealthAfter;
        }
        
        const healthLost = Math.max(0, initialHealth - finalHealth);
        totalHealthLost += healthLost;
        validRuns++;
      }
    }

    return validRuns > 0 ? totalHealthLost / validRuns : 0;
  }
}
