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
    return this.generateMonsterOfTargetDifficulty(targetDifficulty);
  }

  /**
   * Generates a monster within target difficulty range
   * Reuses the same difficulty-based selection logic as generateRandomMonster
   */
  private generateMonsterOfTargetDifficulty(
    targetDifficulty: number
  ): Monster {
    const difficultyRange = this.getDifficultyRange(targetDifficulty);

    // Get suitable monster options within the difficulty range
    const suitableMonsters =
      this.getSuitableMonstersForDifficulty(difficultyRange);

    if (suitableMonsters.length === 0) {
      // Fallback: use any monster with medium tier if no suitable monsters found
      console.warn(
        `No suitable monsters found for target difficulty ${targetDifficulty}, falling back to medium tier`
      );
      const monsterTypes = Object.values(MonsterType);
      const randomType = this.randomService.randomChoice(monsterTypes);
      return this.createMonster(randomType, MonsterTier.MEDIUM);
    }

    // Select random monster from suitable options
    const randomMonster = this.randomService.randomChoice(suitableMonsters);

    // Generate the monster with appropriate stats
    return this.createMonster(
      randomMonster.type,
      randomMonster.tier
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
    tier: MonsterTier
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
    } 

    const levelScaling = 2;
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
    return this.createMonster(type, tier);
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
      monsterData.baseAttack * 0.4 +
      monsterData.baseDefense * 0.3 +
      monsterData.baseSpeed * 0.2;

    this.monsterDifficulties.set(type, difficulty);
    return difficulty;
  }

  /**
   * Calculates the effective difficulty of a monster with tier and level scaling
   */
  private getEffectiveDifficulty(
    type: MonsterType,
    tier: MonsterTier
  ): number {
    const baseDifficulty = this.getMonsterBaseDifficulty(type);
    const tierData = this.monsterConfig.tiers[tier];

    return Math.round(baseDifficulty * tierData.multiplier * 10) / 10;
  }

  /**
   * Determines target difficulty for a hero level
   */
  private getTargetDifficultyForLevel(heroLevel: number): number {
    return 8 + heroLevel * 4; // Base difficulty grows with hero level
  }

  /**
   * Gets acceptable difficulty range around target
   */
  private getDifficultyRange(targetDifficulty: number): {
    min: number;
    max: number;
  } {
    const tolerance = targetDifficulty * 0.3; // ±30% tolerance
    return {
      min: Math.round((targetDifficulty - tolerance) * 100) / 100,
      max: Math.round((targetDifficulty + tolerance) * 100) / 100
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
        const effectiveDifficulty = this.getEffectiveDifficulty(type, tier);

        if (
          effectiveDifficulty >= difficultyRange.min &&
          effectiveDifficulty <= difficultyRange.max
        ) {
          console.log(`Found suitable monster: ${type} (Tier: ${tier}) - Difficulty: ${effectiveDifficulty} (${difficultyRange.min} to ${difficultyRange.max})`);

          suitableMonsters.push({ type, tier });
        }
      }
    }

    return suitableMonsters;
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
      monster.maxHealth * 0.3 + monster.attack * 0.3 + monster.defense * 0.2 + monster.speed * 0.2;

    return difficulty;
  }

  /**
   * Generates multiple monsters for an encounter based on hero level
   * Uses difficulty-based selection to ensure balanced encounters regardless of monster types
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

    return this.generateMixedEncounter(
      numMonsters,
      totalTargetDifficulty
    );
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
        return 1.1;
      case 2:
        return 0.6; // 60% difficulty per monster (120% total)
      case 3:
        return 0.45; // 45% difficulty per monster (135% total)
      case 4:
        return 0.35; // 35% difficulty per monster (140% total)
      default:
        return 0.6;
    }
  }

  /**
   * Generates an encounter with monsters within target difficulty range
   * Reuses the same difficulty-based selection as single monster generation
   */
  private generateMixedEncounter(
    numMonsters: number,
    totalTargetDifficulty: number
  ): Monster[] {
    const monsters: Monster[] = [];
    const targetDifficultyPerMonster = totalTargetDifficulty / numMonsters;

    for (let i = 0; i < numMonsters; i++) {
      const monster = this.generateMonsterOfTargetDifficulty(targetDifficultyPerMonster);
      monsters.push(monster);
    }

    return monsters;
  }
}
