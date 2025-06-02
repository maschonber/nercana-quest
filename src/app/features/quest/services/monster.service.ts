import { Injectable } from '@angular/core';
import { Monster, MonsterTier, MonsterType } from '../models/monster.model';
import { MonsterConfig } from '../models/monster-data.model';
import { MONSTER_CONFIG } from '../../../../assets/data/monster-config';
import { RandomService } from '../../../shared';

// Species groupings for multi-monster encounters
export interface SpeciesGroup {
  name: string;
  types: MonsterType[];
  cooperation: number; // 0-1 scale, how likely they are to work together
}

@Injectable({
  providedIn: 'root'
})
export class MonsterService {
  private monsterConfig: MonsterConfig = MONSTER_CONFIG;

  // Cache for calculated monster difficulties to avoid repeated calculations
  private monsterDifficulties: Map<MonsterType, number> = new Map();

  constructor(private randomService: RandomService) {}

  // Species affinity system for multi-monster encounters
  private readonly speciesGroups: SpeciesGroup[] = [
    {
      name: 'Slug Species',
      types: [MonsterType.SPACE_SLUG, MonsterType.SLUG_SWARM],
      cooperation: 0.9 // High cooperation within species
    },
    {
      name: 'Xriit Forces',
      types: [
        MonsterType.XRIIT,
        MonsterType.XRIIT_SCOUT,
        MonsterType.XRIIT_COMMANDER
      ],
      cooperation: 0.85 // Military organization
    },
    {
      name: 'Moggo Clans',
      types: [
        MonsterType.MOGGO,
        MonsterType.MOGGO_BRUTE
      ],
      cooperation: 0.8 // Pack hunters
    },
    {
      name: 'Vermin Infestation',
      types: [MonsterType.CRITTER],
      cooperation: 0.95 // Hive mind behavior
    },
    {
      name: 'Mercenary Units',
      types: [
        MonsterType.SPACE_MERC,
        MonsterType.MERC_RAIDER,
        MonsterType.MERC_CAPTAIN
      ],
      cooperation: 0.7 // Hired guns, some coordination
    },
    {
      name: 'Station Systems',
      types: [MonsterType.STATION_DEFENSE, MonsterType.ROGUE_AI],
      cooperation: 0.6 // Networked but potentially conflicting systems
    },
    {
      name: 'Cosmic Entities',
      types: [MonsterType.VOID_ENTITY],
      cooperation: 0.3 // Solitary, alien beings
    }
  ];

  /**
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
    const suitableMonsters =
      this.getSuitableMonstersForDifficulty(difficultyRange);

    if (suitableMonsters.length === 0) {
      // Fallback to simple tier-based system if no suitable monsters found
      console.warn(
        `No suitable monsters found for hero level ${heroLevel}, falling back to tier-based selection`
      );
      return this.generateFallbackMonster(heroLevel);
    }

    // Select random monster from suitable options
    const randomMonster = this.randomService.randomChoice(suitableMonsters);

    // Generate the monster with appropriate stats
    return this.createMonster(
      randomMonster.type,
      randomMonster.tier,
      heroLevel
    );
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
      return this.randomService.rollDice(0.1) ? MonsterTier.BOSS : MonsterTier.HARD;
    }
  }
  /**
   * Creates a monster with appropriate stats based on type and tier
   */
  private createMonster(
    type: MonsterType,
    tier: MonsterTier,
    heroLevel: number
  ): Monster {
    // Get monster data from configuration
    const monsterData = this.monsterConfig.monsters[type];
    if (!monsterData) {
      throw new Error(`Monster type ${type} not found in configuration`);
    }

    // Get tier data from configuration
    const tierData = this.monsterConfig.tiers[tier];
    if (!tierData) {
      throw new Error(`Monster tier ${tier} not found in configuration`);
    } // Apply tier multiplier and hero level scaling
    const levelScaling = 1 + heroLevel * 0.1;
    const finalMultiplier = tierData.multiplier * levelScaling; // Calculate final stats
    const health = Math.floor(monsterData.baseHealth * finalMultiplier);
    const attack = Math.floor(monsterData.baseAttack * finalMultiplier);
    const defense = Math.floor(monsterData.baseDefense * finalMultiplier);
    const speed = Math.floor(monsterData.baseSpeed * finalMultiplier);
    const experienceReward = Math.floor(
      monsterData.baseExpReward * finalMultiplier
    );

    // Choose appropriate name: use tier-specific name if available, otherwise fallback to prefix + base name
    const name =
      monsterData.tierNames?.[tier] || tierData.prefix + monsterData.name;

    // Return the fully configured monster
    return {
      type,
      name,
      health,
      maxHealth: health,
      attack,
      defense,
      speed,
      experienceReward,
      description: monsterData.description,
      abilities: monsterData.abilities
    };
  }

  /**
   * Creates a specific monster for combat simulation
   * Uses a baseline hero level of 10 for consistent stat scaling
   */
  createMonsterForSimulation(type: MonsterType, tier: MonsterTier): Monster {
    const baselineHeroLevel = 10; // Consistent scaling reference
    return this.createMonster(type, tier, baselineHeroLevel);
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
    const difficulty =
      monsterData.baseHealth * 0.4 +
      monsterData.baseAttack * 0.35 +
      monsterData.baseDefense * 0.25;

    this.monsterDifficulties.set(type, difficulty);
    return difficulty;
  }

  /**
   * Calculates the effective difficulty of a monster with tier and level scaling
   */
  private getEffectiveDifficulty(
    type: MonsterType,
    tier: MonsterTier,
    heroLevel: number
  ): number {
    const baseDifficulty = this.getMonsterBaseDifficulty(type);
    const tierData = this.monsterConfig.tiers[tier];
    const levelScaling = 1 + heroLevel * 0.1;

    return baseDifficulty * tierData.multiplier * levelScaling;
  }

  /**
   * Determines target difficulty for a hero level
   */
  private getTargetDifficultyForLevel(heroLevel: number): number {
    // Base difficulty grows with hero level, with some variance for challenge
    const baseDifficulty = 15 + heroLevel * 3; // Roughly scales with typical monster progression
    const variance = baseDifficulty * 0.2; // ±20% variance

    return baseDifficulty + this.randomService.randomVariance(baseDifficulty, 0.2); // ±20% variance around base
  }

  /**
   * Gets acceptable difficulty range around target
   */
  private getDifficultyRange(targetDifficulty: number): {
    min: number;
    max: number;
  } {
    const tolerance = targetDifficulty * 0.5; // ±50% tolerance
    return {
      min: targetDifficulty - tolerance,
      max: targetDifficulty + tolerance
    };
  }

  /**
   * Finds suitable monster type/tier combinations for given difficulty range
   */
  private getSuitableMonstersForDifficulty(difficultyRange: {
    min: number;
    max: number;
  }): Array<{ type: MonsterType; tier: MonsterTier }> {
    const suitableMonsters: Array<{ type: MonsterType; tier: MonsterTier }> =
      [];
    const monsterTypes = Object.values(MonsterType);
    const tierTypes = Object.values(MonsterTier);

    // Check all combinations of monster types and tiers
    for (const type of monsterTypes) {
      for (const tier of tierTypes) {
        // Use average hero level for difficulty calculation (level 5 as baseline)
        const effectiveDifficulty = this.getEffectiveDifficulty(type, tier, 5);

        if (
          effectiveDifficulty >= difficultyRange.min &&
          effectiveDifficulty <= difficultyRange.max
        ) {
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
    const randomType = this.randomService.randomChoice(monsterTypes);

    return this.createMonster(randomType, tier, heroLevel);
  }
  /**
   * Debug method to analyze monster distribution for a given hero level
   * Useful for balancing and testing the difficulty system
   */
  analyzeMonsterDistribution(
    heroLevel: number,
    sampleSize: number = 100
  ): { [key: string]: number } {
    const distribution: { [key: string]: number } = {};

    for (let i = 0; i < sampleSize; i++) {
      const monster = this.generateRandomMonster(heroLevel);
      const key = monster.name; // Use the actual tier-specific name
      distribution[key] = (distribution[key] || 0) + 1;
    }

    // Convert to percentages and sort by frequency
    const sorted = Object.entries(distribution)
      .map(([name, count]) => ({
        name,
        percentage: ((count / sampleSize) * 100).toFixed(1)
      }))
      .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

    const result: { [key: string]: number } = {};
    sorted.forEach((item) => {
      result[item.name] = parseFloat(item.percentage);
    });

    return result;
  }

  /**
   * Calculates the effective difficulty of a monster instance based on its actual stats
   * This method uses the same weighted formula as the internal difficulty calculations
   * @param monster The monster instance to calculate difficulty for
   * @returns The effective difficulty value
   */
  public calculateMonsterInstanceDifficulty(monster: any): number {
    if (!monster) {
      return 10; // Default low difficulty for null/undefined monsters
    }

    // Use the same weighted formula as getMonsterBaseDifficulty
    // Health contributes 40%, Attack 35%, Defense 25%
    const difficulty =
      monster.maxHealth * 0.4 + monster.attack * 0.35 + monster.defense * 0.25;

    return difficulty;
  }

  /**
   * Generates multiple monsters for an encounter based on hero level and species affinity
   * @param heroLevel Current level of the hero
   * @param maxMonsters Maximum number of monsters to generate (default 1-3)
   * @returns Array of monsters with appropriate difficulty balancing
   */
  generateMultiMonsterEncounter(
    heroLevel: number,
    maxMonsters: number = 3
  ): Monster[] {
    // 30% chance for multi-monster encounter, increasing slightly with hero level
    const multiMonsterChance = 0.2 + heroLevel * 0.01; // 20% at level 1, 30% at level 10+

    if (!this.randomService.rollDice(multiMonsterChance)) {
      // Single monster encounter
      return [this.generateRandomMonster(heroLevel)];
    }

    // Determine number of monsters (2-3 for most cases, occasionally more for higher levels)
    const numMonsters = this.getEncounterSize(heroLevel, maxMonsters);

    // Calculate total target difficulty for the encounter
    const singleMonsterDifficulty = this.getTargetDifficultyForLevel(heroLevel);
    const totalTargetDifficulty =
      singleMonsterDifficulty *
      this.getMultiMonsterDifficultyMultiplier(numMonsters);

    // Choose encounter type: species-based or mixed
    const useSpeciesGroup = this.randomService.rollDice(0.7); // 70% chance for species-based encounters

    if (useSpeciesGroup) {
      return this.generateSpeciesEncounter(
        heroLevel,
        numMonsters,
        totalTargetDifficulty
      );
    } else {
      return this.generateMixedEncounter(
        heroLevel,
        numMonsters,
        totalTargetDifficulty
      );
    }
  }

  /**
   * Determines appropriate encounter size based on hero level
   */
  private getEncounterSize(heroLevel: number, maxMonsters: number): number {
    if (heroLevel <= 3) {
      // Early levels: mostly 2 monsters
      return this.randomService.rollDice(0.8) ? 2 : 3;
    } else if (heroLevel <= 6) {
      // Mid levels: 2-3 monsters
      return this.randomService.rollDice(0.6) ? 2 : 3;
    } else {
      // High levels: 2-4 monsters, but capped by maxMonsters
      const weights = [0, 0, 0.4, 0.4, 0.2]; // 0% for 0-1, 40% for 2, 40% for 3, 20% for 4
      const roll = this.randomService.random();
      let cumulative = 0;
      for (let i = 2; i <= Math.min(4, maxMonsters); i++) {
        cumulative += weights[i];
        if (roll < cumulative) {
          return i;
        }
      }
      return 3; // fallback
    }
  }

  /**
   * Calculates difficulty multiplier for multi-monster encounters
   * Multiple enemies should be somewhat easier individually to maintain balance
   */
  private getMultiMonsterDifficultyMultiplier(numMonsters: number): number {
    // Slightly reduce individual monster difficulty as group size increases
    switch (numMonsters) {
      case 1:
        return 1.0;
      case 2:
        return 0.9; // 90% difficulty per monster (180% total)
      case 3:
        return 0.75; // 75% difficulty per monster (225% total)
      case 4:
        return 0.65; // 65% difficulty per monster (260% total)
      default:
        return 0.6;
    }
  }

  /**
   * Generates an encounter with monsters from the same species group
   */
  private generateSpeciesEncounter(
    heroLevel: number,
    numMonsters: number,
    totalTargetDifficulty: number
  ): Monster[] {
    // Choose a species group with sufficient monster types
    const availableGroups = this.speciesGroups.filter(
      (group) => group.types.length >= 1
    );
    const selectedGroup = this.randomService.randomChoice(availableGroups);

    const monsters: Monster[] = [];
    const targetDifficultyPerMonster = totalTargetDifficulty / numMonsters;

    for (let i = 0; i < numMonsters; i++) {
      // Allow some variety within the species group
      const monsterType = this.randomService.randomChoice(selectedGroup.types);
      const monster = this.generateMonsterOfTargetDifficulty(
        monsterType,
        heroLevel,
        targetDifficultyPerMonster
      );
      monsters.push(monster);
    }

    return monsters;
  }

  /**
   * Generates an encounter with monsters from different species groups
   */
  private generateMixedEncounter(
    heroLevel: number,
    numMonsters: number,
    totalTargetDifficulty: number
  ): Monster[] {
    const monsters: Monster[] = [];
    const targetDifficultyPerMonster = totalTargetDifficulty / numMonsters;

    // Select different monster types for variety
    const allTypes = Object.values(MonsterType);
    const selectedTypes: MonsterType[] = [];

    for (let i = 0; i < numMonsters; i++) {
      // Try to avoid duplicates, but allow them if we run out of types
      let attempts = 0;
      let monsterType: MonsterType;

      do {
        monsterType = this.randomService.randomChoice(allTypes);
        attempts++;
      } while (selectedTypes.includes(monsterType) && attempts < 10);

      selectedTypes.push(monsterType);
      const monster = this.generateMonsterOfTargetDifficulty(
        monsterType,
        heroLevel,
        targetDifficultyPerMonster
      );
      monsters.push(monster);
    }

    return monsters;
  }

  /**
   * Generates a monster of a specific type with target difficulty
   */
  private generateMonsterOfTargetDifficulty(
    monsterType: MonsterType,
    heroLevel: number,
    targetDifficulty: number
  ): Monster {
    // Find the best tier for this monster type to match target difficulty
    const tierTypes = Object.values(MonsterTier);
    let bestTier = MonsterTier.MEDIUM;
    let bestDifferenceDiff = Infinity;

    for (const tier of tierTypes) {
      const effectiveDifficulty = this.getEffectiveDifficulty(
        monsterType,
        tier,
        heroLevel
      );
      const difference = Math.abs(effectiveDifficulty - targetDifficulty);

      if (difference < bestDifferenceDiff) {
        bestDifferenceDiff = difference;
        bestTier = tier;
      }
    }

    return this.createMonster(monsterType, bestTier, heroLevel);
  }

  /**
   * Calculates total difficulty for a group of monsters
   */
  public calculateGroupDifficulty(monsters: Monster[]): number {
    return monsters.reduce((total, monster) => {
      return total + this.calculateMonsterInstanceDifficulty(monster);
    }, 0);
  }
}
