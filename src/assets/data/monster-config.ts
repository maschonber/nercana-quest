import { MonsterType, MonsterTier } from '../../app/features/quest/models/monster.model';
import { MonsterConfig, MonsterData, TierData } from '../../app/features/quest/models/monster-data.model';

/**
 * Type-safe monster configuration
 * This file provides compile-time type checking while keeping data separate from logic
 */

const monsters: Record<MonsterType, MonsterData> = {
  [MonsterType.GOBLIN]: {
    baseHealth: 20,
    baseAttack: 8,
    baseDefense: 5,
    baseExpReward: 15,
    baseGoldReward: 8,
    name: 'Goblin',
    description: 'A small, green-skinned creature with a knack for mischief.',
    tierNames: {
      [MonsterTier.EASY]: 'Goblin Scavenger',
      [MonsterTier.MEDIUM]: 'Goblin Warrior',
      [MonsterTier.HARD]: 'Goblin Chieftain',
      [MonsterTier.BOSS]: 'Goblin King'
    }
  },
  [MonsterType.TROLL]: {
    baseHealth: 40,
    baseAttack: 12,
    baseDefense: 8,
    baseExpReward: 25,
    baseGoldReward: 15,
    name: 'Troll',
    description: 'A large, brutish creature with regenerative abilities.',
    tierNames: {
      [MonsterTier.EASY]: 'Cave Troll',
      [MonsterTier.MEDIUM]: 'Mountain Troll',
      [MonsterTier.HARD]: 'Elder Troll',
      [MonsterTier.BOSS]: 'Troll Overlord'
    }
  },
  [MonsterType.BANDIT]: {
    baseHealth: 25,
    baseAttack: 10,
    baseDefense: 6,
    baseExpReward: 18,
    baseGoldReward: 20,
    name: 'Bandit',
    description: 'A human outlaw lurking in the wilds.',
    tierNames: {
      [MonsterTier.EASY]: 'Bandit Footpad',
      [MonsterTier.MEDIUM]: 'Bandit Cutthroat',
      [MonsterTier.HARD]: 'Bandit Captain',
      [MonsterTier.BOSS]: 'Bandit Lord'
    }
  },
  [MonsterType.WOLF]: {
    baseHealth: 22,
    baseAttack: 11,
    baseDefense: 4,
    baseExpReward: 16,
    baseGoldReward: 5,
    name: 'Wolf',
    description: 'A fierce predator hunting in packs.',
    tierNames: {
      [MonsterTier.EASY]: 'Wolf Pup',
      [MonsterTier.MEDIUM]: 'Gray Wolf',
      [MonsterTier.HARD]: 'Dire Wolf',
      [MonsterTier.BOSS]: 'Wolf Alpha'
    }
  },
  [MonsterType.SPIDER]: {
    baseHealth: 18,
    baseAttack: 9,
    baseDefense: 5,
    baseExpReward: 14,
    baseGoldReward: 7,
    name: 'Giant Spider',
    description: 'A venomous arachnid the size of a dog.',
    tierNames: {
      [MonsterTier.EASY]: 'Web Spider',
      [MonsterTier.MEDIUM]: 'Hunting Spider',
      [MonsterTier.HARD]: 'Venomous Spider',
      [MonsterTier.BOSS]: 'Spider Queen'
    }
  },
  [MonsterType.SKELETON]: {
    baseHealth: 28,
    baseAttack: 9,
    baseDefense: 7,
    baseExpReward: 20,
    baseGoldReward: 10,
    name: 'Skeleton Warrior',
    description: 'An animated skeleton clutching rusty weapons.',
    tierNames: {
      [MonsterTier.EASY]: 'Brittle Skeleton',
      [MonsterTier.MEDIUM]: 'Skeleton Warrior',
      [MonsterTier.HARD]: 'Skeleton Champion',
      [MonsterTier.BOSS]: 'Bone Lord'
    }
  },
  [MonsterType.ZOMBIE]: {
    baseHealth: 32,
    baseAttack: 8,
    baseDefense: 5,
    baseExpReward: 17,
    baseGoldReward: 8,
    name: 'Zombie',
    description: 'A shambling undead creature hungry for flesh.',
    tierNames: {
      [MonsterTier.EASY]: 'Rotting Corpse',
      [MonsterTier.MEDIUM]: 'Shambling Zombie',
      [MonsterTier.HARD]: 'Plague Zombie',
      [MonsterTier.BOSS]: 'Zombie Hulk'
    }
  },
  [MonsterType.DRAGON]: {
    baseHealth: 80,
    baseAttack: 18,
    baseDefense: 15,
    baseExpReward: 50,
    baseGoldReward: 100,
    name: 'Dragon',
    description: 'A fearsome reptilian beast with scales and fire breath.',
    tierNames: {
      [MonsterTier.EASY]: 'Dragon Wyrmling',
      [MonsterTier.MEDIUM]: 'Young Dragon',
      [MonsterTier.HARD]: 'Adult Dragon',
      [MonsterTier.BOSS]: 'Ancient Dragon'
    }
  },
  [MonsterType.RAT]: {
    baseHealth: 12,
    baseAttack: 5,
    baseDefense: 2,
    baseExpReward: 8,
    baseGoldReward: 3,
    name: 'Giant Rat',
    description: 'A disease-ridden rodent grown to unusual size.',
    tierNames: {
      [MonsterTier.EASY]: 'Sewer Rat',
      [MonsterTier.MEDIUM]: 'Giant Rat',
      [MonsterTier.HARD]: 'Plague Rat',
      [MonsterTier.BOSS]: 'Rat King'
    }
  },
  [MonsterType.ORC]: {
    baseHealth: 35,
    baseAttack: 14,
    baseDefense: 8,
    baseExpReward: 22,
    baseGoldReward: 12,
    name: 'Orc Warrior',
    description: 'A savage humanoid with tusks and crude weapons.',
    tierNames: {
      [MonsterTier.EASY]: 'Orc Grunt',
      [MonsterTier.MEDIUM]: 'Orc Warrior',
      [MonsterTier.HARD]: 'Orc Berserker',
      [MonsterTier.BOSS]: 'Orc Warlord'
    }
  },
  [MonsterType.BEAR]: {
    baseHealth: 45,
    baseAttack: 15,
    baseDefense: 10,
    baseExpReward: 28,
    baseGoldReward: 8,
    name: 'Cave Bear',
    description: 'A massive brown bear with razor-sharp claws.',
    tierNames: {
      [MonsterTier.EASY]: 'Black Bear',
      [MonsterTier.MEDIUM]: 'Cave Bear',
      [MonsterTier.HARD]: 'Dire Bear',
      [MonsterTier.BOSS]: 'Great Bear'
    }
  },
  [MonsterType.GARGOYLE]: {
    baseHealth: 38,
    baseAttack: 13,
    baseDefense: 12,
    baseExpReward: 24,
    baseGoldReward: 15,
    name: 'Stone Gargoyle',
    description: 'A living statue with wings and piercing eyes.',
    tierNames: {
      [MonsterTier.EASY]: 'Cracked Gargoyle',
      [MonsterTier.MEDIUM]: 'Stone Gargoyle',
      [MonsterTier.HARD]: 'Iron Gargoyle',
      [MonsterTier.BOSS]: 'Gargoyle Sentinel'
    }
  },
  [MonsterType.WRAITH]: {
    baseHealth: 30,
    baseAttack: 16,
    baseDefense: 4,
    baseExpReward: 26,
    baseGoldReward: 18,
    name: 'Wraith',
    description: 'A ghostly specter that drains the life from the living.',
    tierNames: {
      [MonsterTier.EASY]: 'Lost Spirit',
      [MonsterTier.MEDIUM]: 'Wraith',
      [MonsterTier.HARD]: 'Banshee',
      [MonsterTier.BOSS]: 'Wraith Lord'
    }
  },
  [MonsterType.MINOTAUR]: {
    baseHealth: 55,
    baseAttack: 17,
    baseDefense: 11,
    baseExpReward: 35,
    baseGoldReward: 25,
    name: 'Minotaur',
    description: 'A bull-headed giant wielding a massive axe.',
    tierNames: {
      [MonsterTier.EASY]: 'Young Minotaur',
      [MonsterTier.MEDIUM]: 'Minotaur Warrior',
      [MonsterTier.HARD]: 'Minotaur Brute',
      [MonsterTier.BOSS]: 'Minotaur Champion'
    }
  },
  [MonsterType.DEMON]: {
    baseHealth: 65,
    baseAttack: 20,
    baseDefense: 13,
    baseExpReward: 45,
    baseGoldReward: 50,
    name: 'Lesser Demon',
    description: 'A fiendish creature from the depths of the underworld.',
    tierNames: {
      [MonsterTier.EASY]: 'Imp',
      [MonsterTier.MEDIUM]: 'Lesser Demon',
      [MonsterTier.HARD]: 'Demon',
      [MonsterTier.BOSS]: 'Demon Lord'
    }
  },
  [MonsterType.LICH]: {
    baseHealth: 70,
    baseAttack: 22,
    baseDefense: 16,
    baseExpReward: 60,
    baseGoldReward: 80,
    name: 'Lich',
    description: 'An undead sorcerer with immense magical power.',
    tierNames: {
      [MonsterTier.EASY]: 'Necromancer',
      [MonsterTier.MEDIUM]: 'Dark Mage',
      [MonsterTier.HARD]: 'Lich',
      [MonsterTier.BOSS]: 'Archlich'
    }
  }
};

const tiers: Record<MonsterTier, TierData> = {
  [MonsterTier.EASY]: {
    multiplier: 0.8,
    prefix: 'Young '
  },
  [MonsterTier.MEDIUM]: {
    multiplier: 1.2,
    prefix: ''
  },
  [MonsterTier.HARD]: {
    multiplier: 1.8,
    prefix: 'Veteran '
  },
  [MonsterTier.BOSS]: {
    multiplier: 3.0,
    prefix: 'Ancient '
  }
};

/**
 * Exported monster configuration with full type safety
 * 
 * Benefits:
 * - Compile-time type checking
 * - IntelliSense support
 * - Refactoring safety
 * - Still separated from business logic
 */
export const MONSTER_CONFIG: MonsterConfig = {
  monsters,
  tiers
} as const;

// Export individual configurations for selective access
export { monsters as MONSTER_DATA, tiers as TIER_DATA };
