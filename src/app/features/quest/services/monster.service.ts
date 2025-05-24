import { Injectable } from '@angular/core';
import { Monster, MonsterTier, MonsterType } from '../models/monster.model';

@Injectable({
  providedIn: 'root'
})
export class MonsterService {
  /**
   * Creates a random monster appropriate for hero's level
   * @param heroLevel Current level of the hero
   * @returns A generated monster instance
   */
  generateRandomMonster(heroLevel: number): Monster {
    // Determine appropriate monster tier
    const tier = this.getMonsterTierForLevel(heroLevel);
    
    // Select random monster type from available types
    const monsterTypes = Object.values(MonsterType);
    const randomType = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
    
    // Generate the monster with appropriate stats for the tier
    return this.createMonster(randomType, tier, heroLevel);
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
      return Math.random() < 0.1 ? MonsterTier.BOSS : MonsterTier.HARD;
    }
  }

  /**
   * Creates a monster with appropriate stats based on type and tier
   */  private createMonster(type: MonsterType, tier: MonsterTier, heroLevel: number): Monster {
    // Base stats that will be modified by tier
    let baseHealth = 0;
    let baseAttack = 0;
    let baseDefense = 0;
    let baseExpReward = 0;
    let baseGoldReward = 0;
    let name = '';
    let description = '';

    // Set base stats by monster type
    switch (type) {
      case MonsterType.GOBLIN:
        baseHealth = 20;
        baseAttack = 8;
        baseDefense = 5;
        baseExpReward = 15;
        baseGoldReward = 8;
        name = 'Goblin';
        description = 'A small, green-skinned creature with a knack for mischief.';
        break;      case MonsterType.TROLL:
        baseHealth = 40;
        baseAttack = 12;
        baseDefense = 8;
        baseExpReward = 25;
        baseGoldReward = 15;
        name = 'Troll';
        description = 'A large, brutish creature with regenerative abilities.';
        break;      case MonsterType.BANDIT:
        baseHealth = 25;
        baseAttack = 10;
        baseDefense = 6;
        baseExpReward = 18;
        baseGoldReward = 20;
        name = 'Bandit';
        description = 'A human outlaw lurking in the wilds.';
        break;      case MonsterType.WOLF:
        baseHealth = 22;
        baseAttack = 11;
        baseDefense = 4;
        baseExpReward = 16;
        baseGoldReward = 5;
        name = 'Wolf';
        description = 'A fierce predator hunting in packs.';
        break;      case MonsterType.SPIDER:
        baseHealth = 18;
        baseAttack = 9;
        baseDefense = 5;
        baseExpReward = 14;
        baseGoldReward = 7;
        name = 'Giant Spider';
        description = 'A venomous arachnid the size of a dog.';
        break;      case MonsterType.SKELETON:
        baseHealth = 28;
        baseAttack = 9;
        baseDefense = 7;
        baseExpReward = 20;
        baseGoldReward = 10;
        name = 'Skeleton Warrior';
        description = 'An animated skeleton clutching rusty weapons.';
        break;      case MonsterType.ZOMBIE:
        baseHealth = 32;
        baseAttack = 8;
        baseDefense = 5;
        baseExpReward = 17;
        baseGoldReward = 8;
        name = 'Zombie';
        description = 'A shambling undead creature hungry for flesh.';
        break;      case MonsterType.DRAGON:
        baseHealth = 80;
        baseAttack = 18;
        baseDefense = 15;
        baseExpReward = 50;
        baseGoldReward = 100;
        name = 'Dragon';
        description = 'A fearsome reptilian beast with scales and fire breath.';
        break;
    }    // Apply tier multipliers
    let tierMultiplier = 1.0;
    let prefixName = '';
    
    switch (tier) {
      case MonsterTier.EASY:
        tierMultiplier = 0.8;
        prefixName = 'Young ';
        break;
      case MonsterTier.MEDIUM:
        tierMultiplier = 1.2;
        // No prefix for medium tier
        break;
      case MonsterTier.HARD:
        tierMultiplier = 1.8;
        prefixName = 'Veteran ';
        break;
      case MonsterTier.BOSS:
        tierMultiplier = 3.0;
        prefixName = 'Ancient ';
        break;
    }

    // Apply hero level scaling (slight increase with level)
    const levelScaling = 1 + (heroLevel * 0.1);
      // Calculate final stats
    const health = Math.floor(baseHealth * tierMultiplier * levelScaling);
    const attack = Math.floor(baseAttack * tierMultiplier * levelScaling);
    const defense = Math.floor(baseDefense * tierMultiplier * levelScaling);
    const experienceReward = Math.floor(baseExpReward * tierMultiplier * levelScaling);
    const goldReward = Math.floor(baseGoldReward * tierMultiplier * levelScaling);

    // Apply name prefix based on tier
    name = prefixName + name;

    // Return the fully configured monster
    return {
      type,
      name,
      health,
      maxHealth: health,
      attack,
      defense,
      experienceReward,
      goldReward,
      description
    };
  }
}
