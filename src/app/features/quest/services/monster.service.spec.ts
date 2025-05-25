import { TestBed } from '@angular/core/testing';
import { MonsterService } from './monster.service';
import { MonsterTier, MonsterType } from '../models/monster.model';

describe('MonsterService', () => {
  let service: MonsterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonsterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generateRandomMonster', () => {
    it('should generate monster with appropriate stats for hero level', () => {
      // Test with different hero levels
      const levels = [1, 3, 6, 10];

      levels.forEach(level => {
        const monster = service.generateRandomMonster(level);

        // Monster should have all required properties
        expect(monster).toHaveProperty('type');
        expect(monster).toHaveProperty('name');
        expect(monster).toHaveProperty('health');
        expect(monster).toHaveProperty('maxHealth');
        expect(monster).toHaveProperty('attack');
        expect(monster).toHaveProperty('defense');
        expect(monster).toHaveProperty('experienceReward');
        expect(monster).toHaveProperty('goldReward');
        expect(monster).toHaveProperty('description');

        // Stats should be positive numbers
        expect(monster.health).toBeGreaterThan(0);
        expect(monster.maxHealth).toBe(monster.health);
        expect(monster.attack).toBeGreaterThan(0);
        expect(monster.defense).toBeGreaterThan(0);
        expect(monster.experienceReward).toBeGreaterThan(0);
        expect(monster.goldReward).toBeGreaterThan(0);
      });
    });    it('should scale monster difficulty with hero level', () => {
      // Test the same monster type with different hero levels for consistent comparison
      const lowLevelMonster = service['createMonster'](MonsterType.GOBLIN, MonsterTier.EASY, 1);
      const highLevelMonster = service['createMonster'](MonsterType.GOBLIN, MonsterTier.HARD, 10);

      // Higher level monsters should be stronger due to tier and level scaling
      expect(highLevelMonster.health).toBeGreaterThan(lowLevelMonster.health);
      expect(highLevelMonster.attack).toBeGreaterThan(lowLevelMonster.attack);
      expect(highLevelMonster.experienceReward).toBeGreaterThan(lowLevelMonster.experienceReward);
    });
  });

  describe('Monster Configuration', () => {    it('should load monster data from TypeScript configuration', () => {
      // Test that the service can access configuration data
      expect(service['monsterConfig']).toBeDefined();
      expect(service['monsterConfig'].monsters).toBeDefined();
      expect(service['monsterConfig'].tiers).toBeDefined();
    });it('should have all expected monster types in configuration', () => {
      const config = service['monsterConfig'];
      
      // Verify all monster types are present using enum values
      expect(config.monsters[MonsterType.GOBLIN]).toBeDefined();
      expect(config.monsters[MonsterType.TROLL]).toBeDefined();
      expect(config.monsters[MonsterType.BANDIT]).toBeDefined();
      expect(config.monsters[MonsterType.WOLF]).toBeDefined();
      expect(config.monsters[MonsterType.SPIDER]).toBeDefined();
      expect(config.monsters[MonsterType.SKELETON]).toBeDefined();
      expect(config.monsters[MonsterType.ZOMBIE]).toBeDefined();
      expect(config.monsters[MonsterType.DRAGON]).toBeDefined();
    });    it('should have all expected tier types in configuration', () => {
      const config = service['monsterConfig'];
      
      // Verify all tier types are present using enum values
      expect(config.tiers[MonsterTier.EASY]).toBeDefined();
      expect(config.tiers[MonsterTier.MEDIUM]).toBeDefined();
      expect(config.tiers[MonsterTier.HARD]).toBeDefined();
      expect(config.tiers[MonsterTier.BOSS]).toBeDefined();
    });    it('should generate consistent monsters with same configuration', () => {
      // Create multiple monsters of the same type and tier using enums
      const monster1 = service['createMonster'](MonsterType.GOBLIN, MonsterTier.MEDIUM, 5);
      const monster2 = service['createMonster'](MonsterType.GOBLIN, MonsterTier.MEDIUM, 5);

      // Should have identical stats
      expect(monster1.health).toBe(monster2.health);
      expect(monster1.attack).toBe(monster2.attack);
      expect(monster1.defense).toBe(monster2.defense);
      expect(monster1.experienceReward).toBe(monster2.experienceReward);
      expect(monster1.goldReward).toBe(monster2.goldReward);
    });
  });

  describe('Difficulty-based Monster Generation', () => {
    it('should generate monsters with difficulty appropriate for hero level', () => {
      // Test multiple hero levels
      const heroLevels = [1, 3, 5, 8, 10];
      
      heroLevels.forEach(level => {
        const monsters = [];
        // Generate multiple monsters to test variance
        for (let i = 0; i < 10; i++) {
          monsters.push(service.generateRandomMonster(level));
        }
        
        // All monsters should be valid
        monsters.forEach(monster => {
          expect(monster.health).toBeGreaterThan(0);
          expect(monster.attack).toBeGreaterThan(0);
          expect(monster.defense).toBeGreaterThan(0);
        });
        
        // Should have some variety in monster types (not always the same)
        const uniqueTypes = new Set(monsters.map(m => m.type));
        expect(uniqueTypes.size).toBeGreaterThan(1);
      });
    });

    it('should respect monster base difficulty when selecting types', () => {
      // Low level hero should get easier base monsters more often
      const lowLevelMonsters = [];
      for (let i = 0; i < 50; i++) {
        lowLevelMonsters.push(service.generateRandomMonster(1));
      }
      
      // High level hero should get harder base monsters more often  
      const highLevelMonsters = [];
      for (let i = 0; i < 50; i++) {
        highLevelMonsters.push(service.generateRandomMonster(20));
      }
      
      // Count occurrences of very easy vs very hard monsters
      const lowLevelDragons = lowLevelMonsters.filter(m => m.type === MonsterType.DRAGON).length;
      const lowLevelRats = lowLevelMonsters.filter(m => m.type === MonsterType.RAT).length;
      
      const highLevelDragons = highLevelMonsters.filter(m => m.type === MonsterType.DRAGON).length;
      const highLevelRats = highLevelMonsters.filter(m => m.type === MonsterType.RAT).length;
      
      // Low level heroes should encounter more rats than dragons
      expect(lowLevelRats).toBeGreaterThanOrEqual(lowLevelDragons);
      
      // High level heroes should encounter more dragons than rats
      expect(highLevelDragons).toBeGreaterThanOrEqual(highLevelRats);
    });

    it('should calculate monster base difficulty correctly', () => {
      // Test difficulty calculation for known monsters
      const ratDifficulty = service['getMonsterBaseDifficulty'](MonsterType.RAT);
      const dragonDifficulty = service['getMonsterBaseDifficulty'](MonsterType.DRAGON);
      const goblinDifficulty = service['getMonsterBaseDifficulty'](MonsterType.GOBLIN);
      
      // Dragon should be much harder than rat
      expect(dragonDifficulty).toBeGreaterThan(ratDifficulty * 2);
      
      // Goblin should be harder than rat but easier than dragon
      expect(goblinDifficulty).toBeGreaterThan(ratDifficulty);
      expect(goblinDifficulty).toBeLessThan(dragonDifficulty);
    });

    it('should cache monster difficulties for performance', () => {
      // First call should calculate and cache
      const difficulty1 = service['getMonsterBaseDifficulty'](MonsterType.GOBLIN);
      
      // Second call should use cached value
      const difficulty2 = service['getMonsterBaseDifficulty'](MonsterType.GOBLIN);
      
      expect(difficulty1).toBe(difficulty2);
      expect(service['monsterDifficulties'].has(MonsterType.GOBLIN)).toBe(true);
    });
  });

  describe('Tier-specific Naming', () => {
    it('should use tier-specific names when available', () => {
      // Test monsters with tier-specific names
      const easyDragon = service['createMonster'](MonsterType.DRAGON, MonsterTier.EASY, 5);
      const mediumDragon = service['createMonster'](MonsterType.DRAGON, MonsterTier.MEDIUM, 5);
      const hardDragon = service['createMonster'](MonsterType.DRAGON, MonsterTier.HARD, 5);
      const bossDragon = service['createMonster'](MonsterType.DRAGON, MonsterTier.BOSS, 5);

      expect(easyDragon.name).toBe('Dragon Wyrmling');
      expect(mediumDragon.name).toBe('Young Dragon');
      expect(hardDragon.name).toBe('Adult Dragon');
      expect(bossDragon.name).toBe('Ancient Dragon');
    });

    it('should use different tier names for different monster types', () => {
      // Test different monsters at the same tier have appropriate names
      const easyGoblin = service['createMonster'](MonsterType.GOBLIN, MonsterTier.EASY, 5);
      const easyWolf = service['createMonster'](MonsterType.WOLF, MonsterTier.EASY, 5);
      const easyRat = service['createMonster'](MonsterType.RAT, MonsterTier.EASY, 5);

      expect(easyGoblin.name).toBe('Goblin Scavenger');
      expect(easyWolf.name).toBe('Wolf Pup');
      expect(easyRat.name).toBe('Sewer Rat');

      // Test boss tier names are appropriately dramatic
      const bossGoblin = service['createMonster'](MonsterType.GOBLIN, MonsterTier.BOSS, 5);
      const bossWolf = service['createMonster'](MonsterType.WOLF, MonsterTier.BOSS, 5);
      const bossRat = service['createMonster'](MonsterType.RAT, MonsterTier.BOSS, 5);

      expect(bossGoblin.name).toBe('Goblin King');
      expect(bossWolf.name).toBe('Wolf Alpha');
      expect(bossRat.name).toBe('Rat King');
    });

    it('should fallback to prefix naming if tier-specific name not available', () => {
      // Create a monster configuration without tier names to test fallback
      const originalConfig = service['monsterConfig'];
      
      // Temporarily modify config to remove tier names for one monster
      const testConfig = {
        ...originalConfig,
        monsters: {
          ...originalConfig.monsters,
          [MonsterType.GOBLIN]: {
            ...originalConfig.monsters[MonsterType.GOBLIN],
            tierNames: undefined
          }
        }
      };
      
      service['monsterConfig'] = testConfig;

      const easyGoblin = service['createMonster'](MonsterType.GOBLIN, MonsterTier.EASY, 5);
      expect(easyGoblin.name).toBe('Young Goblin'); // Should use prefix

      // Restore original config
      service['monsterConfig'] = originalConfig;
    });

    it('should generate monsters with tier-specific names in random generation', () => {
      // Generate multiple monsters and verify they have appropriate tier names
      const monsters = [];
      for (let i = 0; i < 20; i++) {
        monsters.push(service.generateRandomMonster(5));
      }

      // All monsters should have names that don't contain generic prefixes like "Young "
      // when tier-specific names are available
      monsters.forEach(monster => {
        expect(monster.name).toBeTruthy();
        expect(monster.name.length).toBeGreaterThan(0);
        
        // Verify the name matches expected tier-specific patterns
        if (monster.type === MonsterType.DRAGON) {
          expect(['Dragon Wyrmling', 'Young Dragon', 'Adult Dragon', 'Ancient Dragon'])
            .toContain(monster.name);
        }
        if (monster.type === MonsterType.RAT) {
          expect(['Sewer Rat', 'Giant Rat', 'Plague Rat', 'Rat King'])
            .toContain(monster.name);
        }
      });
    });
  });
});
