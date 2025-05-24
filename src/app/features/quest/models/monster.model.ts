// Model for monsters/enemies in Nercana combat system
export enum MonsterType {
  GOBLIN = 'goblin',
  TROLL = 'troll',
  BANDIT = 'bandit',
  WOLF = 'wolf',
  SPIDER = 'spider',
  SKELETON = 'skeleton',
  ZOMBIE = 'zombie',
  DRAGON = 'dragon'
}

export interface Monster {
  type: MonsterType;
  name: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  experienceReward: number;
  goldReward: number;
  description: string;
}

// Monster difficulty tiers for appropriate challenges
export enum MonsterTier {
  EASY = 'easy',     // For low-level heroes
  MEDIUM = 'medium', // For mid-level heroes
  HARD = 'hard',     // For high-level heroes
  BOSS = 'boss'      // Special encounters
}

// Function to determine appropriate monster tier based on hero level
export function getAppropriateMonsterTier(heroLevel: number): MonsterTier {
  if (heroLevel <= 3) {
    return MonsterTier.EASY;
  } else if (heroLevel <= 6) {
    return MonsterTier.MEDIUM;
  } else if (heroLevel <= 9) {
    return MonsterTier.HARD;
  } else {
    return MonsterTier.BOSS;
  }
}
