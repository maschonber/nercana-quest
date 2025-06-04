// Model for space enemies in Nercana combat system

// Combat abilities that monsters can possess
export enum CombatAbility {
  ATTACK = 'ATTACK',
  DEFEND = 'DEFEND',
  POISON = 'POISON'
  // Future abilities can be added here (e.g., SPECIAL_ATTACK, HEAL, etc.)
}

export enum MonsterType {
  SPACE_SLUG = 'SPACE_SLUG',
  XRIIT = 'XRIIT',
  MOGGO = 'MOGGO',
  CRITTER = 'CRITTER',
  SPACE_MERC = 'SPACE_MERC',
  // Variations for different difficulty tiers
  SLUG_SWARM = 'SLUG_SWARM',
  XRIIT_SCOUT = 'XRIIT_SCOUT',
  XRIIT_COMMANDER = 'XRIIT_COMMANDER',
  MOGGO_BRUTE = 'MOGGO_BRUTE',
  MERC_RAIDER = 'MERC_RAIDER',
  MERC_CAPTAIN = 'MERC_CAPTAIN',
  STATION_DEFENSE = 'STATION_DEFENSE',
  ROGUE_AI = 'ROGUE_AI',
  VOID_ENTITY = 'VOID_ENTITY'
}

export interface Monster {
  type: MonsterType;
  name: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  experienceReward: number;
  description: string;
  abilities: CombatAbility[]; // List of abilities this monster can use
}

// Monster difficulty tiers for appropriate challenges
export enum MonsterTier {
  EASY = 'easy', // For low-level clones
  MEDIUM = 'medium', // For mid-level clones
  HARD = 'hard', // For high-level clones
  BOSS = 'boss' // Special encounters
}
