import {
  MonsterType,
  MonsterTier,
  CombatAbility
} from '../../app/features/quest/models/monster.model';
import {
  MonsterConfig,
  MonsterData,
  TierData
} from '../../app/features/quest/models/monster-data.model';

/**
 * Type-safe space enemy configuration
 * This file provides compile-time type checking while keeping data separate from logic
 */

const monsters: Record<MonsterType, MonsterData> = {
  [MonsterType.SPACE_SLUG]: {
    baseHealth: 18,
    baseAttack: 6,
    baseDefense: 4,
    baseSpeed: 5, // Slow, gelatinous creature
    baseExpReward: 12,
    name: 'Space Slug',
    description:
      'A gelatinous mollusk that feeds on asteroid minerals and station debris.',
    abilities: [CombatAbility.ATTACK], // Simple creature, only attacks
    tierNames: {
      [MonsterTier.EASY]: 'Juvenile Slug',
      [MonsterTier.MEDIUM]: 'Space Slug',
      [MonsterTier.HARD]: 'Acidic Slug',
      [MonsterTier.BOSS]: 'Slug Queen'
    }
  },
  [MonsterType.XRIIT]: {
    baseHealth: 28,
    baseAttack: 12,
    baseDefense: 8,
    baseSpeed: 9, // Intelligent, tactical creatures
    baseExpReward: 20,
    name: 'Xriit',
    description:
      'Cunning alien strategists with advanced technology and tactical prowess.',
    abilities: [CombatAbility.ATTACK, CombatAbility.DEFEND], // Tactical creatures can defend
    tierNames: {
      [MonsterTier.EASY]: 'Xriit Scout',
      [MonsterTier.MEDIUM]: 'Xriit Warrior',
      [MonsterTier.HARD]: 'Xriit Tactician',
      [MonsterTier.BOSS]: 'Xriit Overlord'
    }
  },
  [MonsterType.MOGGO]: {
    baseHealth: 35,
    baseAttack: 14,
    baseDefense: 6,
    baseSpeed: 6, // Strong but somewhat slow brutes
    baseExpReward: 18,
    name: 'Moggo',
    description:
      'Aggressive, thick-furred brutes that rely on overwhelming strength and pack tactics.',
    abilities: [CombatAbility.ATTACK], // Brute force creatures, only attack
    tierNames: {
      [MonsterTier.EASY]: 'Moggo Youngling',
      [MonsterTier.MEDIUM]: 'Moggo Brute',
      [MonsterTier.HARD]: 'Moggo Alpha',
      [MonsterTier.BOSS]: 'Moggo Warchief'
    }
  },
  [MonsterType.CRITTER]: {
    baseHealth: 8,
    baseAttack: 4,
    baseDefense: 2,
    baseSpeed: 12, // Very fast but weak vermin
    baseExpReward: 6,
    name: 'Critter',
    description:
      'Small vermin infesting maintenance shafts and abandoned station sectors.',
    abilities: [CombatAbility.ATTACK], // Simple vermin, only attack
    tierNames: {
      [MonsterTier.EASY]: 'Station Vermin',
      [MonsterTier.MEDIUM]: 'Mutant Critter',
      [MonsterTier.HARD]: 'Critter Swarm',
      [MonsterTier.BOSS]: 'Hive Mother'
    }
  },

  [MonsterType.SPACE_MERC]: {
    baseHealth: 32,
    baseAttack: 11,
    baseDefense: 9,
    baseSpeed: 8, // Well-balanced humanoid combatants
    baseExpReward: 22,
    name: 'Space Merc',
    description:
      'Zealous humanoid raiders equipped with stolen tech, pursuing glory and salvage.',
    abilities: [CombatAbility.ATTACK], // Basic mercenaries, no advanced tactics
    tierNames: {
      [MonsterTier.EASY]: 'Merc Recruit',
      [MonsterTier.MEDIUM]: 'Space Raider',
      [MonsterTier.HARD]: 'Merc Veteran',
      [MonsterTier.BOSS]: 'Merc Captain'
    }
  },

  [MonsterType.SLUG_SWARM]: {
    baseHealth: 25,
    baseAttack: 8,
    baseDefense: 3,
    baseSpeed: 7, // Coordinated but still slow
    baseExpReward: 16,
    name: 'Slug Swarm',
    description:
      'A writhing mass of interconnected slugs that overwhelm targets with numbers.',
    abilities: [CombatAbility.ATTACK], // Swarm tactics, but no defensive capability
    tierNames: {
      [MonsterTier.EASY]: 'Small Swarm',
      [MonsterTier.MEDIUM]: 'Slug Swarm',
      [MonsterTier.HARD]: 'Acidic Swarm',
      [MonsterTier.BOSS]: 'Mega Swarm'
    }
  },

  [MonsterType.XRIIT_SCOUT]: {
    baseHealth: 22,
    baseAttack: 10,
    baseDefense: 7,
    baseSpeed: 11, // Fast reconnaissance units
    baseExpReward: 15,
    name: 'Xriit Scout',
    description:
      'Fast-moving Xriit reconnaissance units equipped with stealth technology.',
    abilities: [CombatAbility.ATTACK], // Scouts focus on speed, not defense
    tierNames: {
      [MonsterTier.EASY]: 'Xriit Probe',
      [MonsterTier.MEDIUM]: 'Xriit Scout',
      [MonsterTier.HARD]: 'Stealth Scout',
      [MonsterTier.BOSS]: 'Elite Infiltrator'
    }
  },
  [MonsterType.XRIIT_COMMANDER]: {
    baseHealth: 45,
    baseAttack: 16,
    baseDefense: 12,
    baseSpeed: 7, // High-ranking but strategic, not fast
    baseExpReward: 35,
    name: 'Xriit Commander',
    description:
      'High-ranking Xriit officers with powerful weaponry and tactical command abilities.',
    abilities: [CombatAbility.ATTACK, CombatAbility.DEFEND], // Tactical commanders can defend
    tierNames: {
      [MonsterTier.EASY]: 'Xriit Officer',
      [MonsterTier.MEDIUM]: 'Xriit Commander',
      [MonsterTier.HARD]: 'War Commander',
      [MonsterTier.BOSS]: 'Supreme Leader'
    }
  },

  [MonsterType.MOGGO_BRUTE]: {
    baseHealth: 50,
    baseAttack: 18,
    baseDefense: 5,
    baseSpeed: 4, // Massive but very slow
    baseExpReward: 25,
    name: 'Moggo Brute',
    description:
      'Massive Moggo warriors with enhanced strength and intimidating presence.',
    abilities: [CombatAbility.ATTACK], // Pure brute force, no defensive tactics
    tierNames: {
      [MonsterTier.EASY]: 'Moggo Brawler',
      [MonsterTier.MEDIUM]: 'Moggo Brute',
      [MonsterTier.HARD]: 'Moggo Destroyer',
      [MonsterTier.BOSS]: 'Apex Predator'
    }
  },
  [MonsterType.MERC_RAIDER]: {
    baseHealth: 28,
    baseAttack: 13,
    baseDefense: 7,
    baseSpeed: 10, // Hit-and-run specialists
    baseExpReward: 18,
    name: 'Merc Raider',
    description:
      'Aggressive space mercenaries specialized in hit-and-run tactics.',
    abilities: [CombatAbility.ATTACK], // Hit-and-run tactics, no defensive focus
    tierNames: {
      [MonsterTier.EASY]: 'Merc Thug',
      [MonsterTier.MEDIUM]: 'Merc Raider',
      [MonsterTier.HARD]: 'Elite Raider',
      [MonsterTier.BOSS]: 'Raid Leader'
    }
  },

  [MonsterType.MERC_CAPTAIN]: {
    baseHealth: 55,
    baseAttack: 17,
    baseDefense: 11,
    baseSpeed: 6, // Heavy armor reduces speed
    baseExpReward: 40,
    name: 'Merc Captain',
    description:
      'Veteran mercenary leaders with advanced armor and military experience.',
    abilities: [CombatAbility.ATTACK, CombatAbility.DEFEND], // Experienced leaders can defend
    tierNames: {
      [MonsterTier.EASY]: 'Merc Sergeant',
      [MonsterTier.MEDIUM]: 'Merc Captain',
      [MonsterTier.HARD]: 'War Captain',
      [MonsterTier.BOSS]: 'Fleet Admiral'
    }
  },

  [MonsterType.STATION_DEFENSE]: {
    baseHealth: 40,
    baseAttack: 15,
    baseDefense: 14,
    baseSpeed: 3, // Heavy automated systems
    baseExpReward: 30,
    name: 'Station Defense',
    description:
      'Automated defense systems protecting abandoned stations and facilities.',
    abilities: [CombatAbility.ATTACK, CombatAbility.DEFEND], // Defense systems designed to protect
    tierNames: {
      [MonsterTier.EASY]: 'Patrol Drone',
      [MonsterTier.MEDIUM]: 'Security Bot',
      [MonsterTier.HARD]: 'Defense Turret',
      [MonsterTier.BOSS]: 'Command Core'
    }
  },

  [MonsterType.ROGUE_AI]: {
    baseHealth: 60,
    baseAttack: 14,
    baseDefense: 16,
    baseSpeed: 13, // Digital speed of thought
    baseExpReward: 45,
    name: 'Rogue AI',
    description:
      'Malfunctioning artificial intelligence controlling station systems and drones.',
    abilities: [CombatAbility.ATTACK, CombatAbility.DEFEND], // Intelligent AI can use defensive tactics
    tierNames: {
      [MonsterTier.EASY]: 'Glitched AI',
      [MonsterTier.MEDIUM]: 'Rogue AI',
      [MonsterTier.HARD]: 'Hostile AI',
      [MonsterTier.BOSS]: 'AI Overlord'
    }
  },

  [MonsterType.VOID_ENTITY]: {
    baseHealth: 70,
    baseAttack: 20,
    baseDefense: 10,
    baseSpeed: 14, // Otherworldly, unpredictable speed
    baseExpReward: 55,
    name: 'Void Entity',
    description:
      'Mysterious beings from deep space that defy conventional understanding.',
    abilities: [CombatAbility.ATTACK], // Mysterious but aggressive entities
    tierNames: {
      [MonsterTier.EASY]: 'Void Wisp',
      [MonsterTier.MEDIUM]: 'Void Entity',
      [MonsterTier.HARD]: 'Void Horror',
      [MonsterTier.BOSS]: 'Void Sovereign'
    }
  }
};

// Tier multipliers for scaling monster stats by difficulty
const tiers: Record<MonsterTier, TierData> = {
  [MonsterTier.EASY]: {
    multiplier: 0.8,
    prefix: 'Weak '
  },
  [MonsterTier.MEDIUM]: {
    multiplier: 1.0,
    prefix: ''
  },
  [MonsterTier.HARD]: {
    multiplier: 1.3,
    prefix: 'Elite '
  },
  [MonsterTier.BOSS]: {
    multiplier: 1.8,
    prefix: 'Boss '
  }
};

export const MONSTER_CONFIG: MonsterConfig = {
  monsters,
  tiers
} as const;

// Export individual configurations for selective access
export { monsters as MONSTER_DATA, tiers as TIER_DATA };
