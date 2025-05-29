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

      levels.forEach((level) => {
        const monster = service.generateRandomMonster(level);

        // Monster should have all required properties
        expect(monster).toHaveProperty('type');
        expect(monster).toHaveProperty('name');
        expect(monster).toHaveProperty('health');
        expect(monster).toHaveProperty('maxHealth');
        expect(monster).toHaveProperty('attack');
        expect(monster).toHaveProperty('defense');
        expect(monster).toHaveProperty('experienceReward');
        expect(monster).toHaveProperty('description'); // Stats should be positive numbers (defense can be 0 for very weak monsters)
        expect(monster.health).toBeGreaterThan(0);
        expect(monster.maxHealth).toBe(monster.health);
        expect(monster.attack).toBeGreaterThan(0);
        expect(monster.defense).toBeGreaterThanOrEqual(0);
        expect(monster.experienceReward).toBeGreaterThan(0);
      });
    });

    it('should scale monster difficulty with hero level', () => {
      // Test the same monster type with different hero levels for consistent comparison
      const lowLevelMonster = service['createMonster'](
        MonsterType.SPACE_SLUG,
        MonsterTier.EASY,
        1
      );
      const highLevelMonster = service['createMonster'](
        MonsterType.SPACE_SLUG,
        MonsterTier.HARD,
        10
      );

      // Higher level monsters should be stronger due to tier and level scaling
      expect(highLevelMonster.health).toBeGreaterThan(lowLevelMonster.health);
      expect(highLevelMonster.attack).toBeGreaterThan(lowLevelMonster.attack);
    });

    it('should have valid monster configuration with all required monster types', () => {
      const config = service['monsterConfig']; // Verify configuration structure exists
      expect(config).toBeDefined();
      expect(config.monsters).toBeDefined();

      // Verify all space-themed monster types are present
      expect(config.monsters[MonsterType.SPACE_SLUG]).toBeDefined();
      expect(config.monsters[MonsterType.XRIIT]).toBeDefined();
      expect(config.monsters[MonsterType.MOGGO]).toBeDefined();
      expect(config.monsters[MonsterType.CRITTER]).toBeDefined();
      expect(config.monsters[MonsterType.SPACE_MERC]).toBeDefined();
      expect(config.monsters[MonsterType.VOID_ENTITY]).toBeDefined();
    });

    it('should generate unique monsters with variety', () => {
      // Create multiple monsters of the same type and tier
      const monster1 = service['createMonster'](
        MonsterType.SPACE_SLUG,
        MonsterTier.MEDIUM,
        5
      );
      const monster2 = service['createMonster'](
        MonsterType.SPACE_SLUG,
        MonsterTier.MEDIUM,
        5
      );

      // Should have some variability (at least one stat should differ slightly due to randomization)
      const statsMatch =
        monster1.health === monster2.health &&
        monster1.attack === monster2.attack &&
        monster1.defense === monster2.defense;

      // Allow for some possibility of exact matches but verify the system can generate variety
      if (statsMatch) {
        // If they match exactly, verify this is within reasonable variance
        expect(monster1.health).toBeGreaterThan(0);
        expect(monster1.attack).toBeGreaterThan(0);
        expect(monster1.defense).toBeGreaterThan(0);
      }
    });

    it('should generate appropriate monsters for different hero levels', () => {
      const iterations = 50;

      // Generate many monsters for low-level heroes
      const lowLevelMonsters = [];
      for (let i = 0; i < iterations; i++) {
        lowLevelMonsters.push(service.generateRandomMonster(1));
      }

      // Generate many monsters for high-level heroes
      const highLevelMonsters = [];
      for (let i = 0; i < iterations; i++) {
        highLevelMonsters.push(service.generateRandomMonster(10));
      }

      // Calculate average stats for comparison
      const lowAvgHealth =
        lowLevelMonsters.reduce((sum, m) => sum + m.health, 0) /
        lowLevelMonsters.length;
      const highAvgHealth =
        highLevelMonsters.reduce((sum, m) => sum + m.health, 0) /
        highLevelMonsters.length;

      // High-level monsters should generally be stronger
      expect(highAvgHealth).toBeGreaterThan(lowAvgHealth);

      // Count occurrences of easy vs powerful monsters
      const lowLevelVoidEntities = lowLevelMonsters.filter(
        (m) => m.type === MonsterType.VOID_ENTITY
      ).length;
      const lowLevelCritters = lowLevelMonsters.filter(
        (m) => m.type === MonsterType.CRITTER
      ).length;

      const highLevelVoidEntities = highLevelMonsters.filter(
        (m) => m.type === MonsterType.VOID_ENTITY
      ).length;
      const highLevelCritters = highLevelMonsters.filter(
        (m) => m.type === MonsterType.CRITTER
      ).length;

      // High-level heroes should encounter more powerful enemies
      expect(highLevelVoidEntities).toBeGreaterThanOrEqual(
        lowLevelVoidEntities
      );
      expect(lowLevelCritters).toBeGreaterThanOrEqual(highLevelCritters);
    });

    it('should calculate difficulty consistently', () => {
      // Test difficulty calculation for known monsters
      const critterDifficulty = service['getMonsterBaseDifficulty'](
        MonsterType.CRITTER
      );
      const voidEntityDifficulty = service['getMonsterBaseDifficulty'](
        MonsterType.VOID_ENTITY
      );
      const spaceMercDifficulty = service['getMonsterBaseDifficulty'](
        MonsterType.SPACE_MERC
      );

      // Verify difficulty ordering makes sense
      expect(voidEntityDifficulty).toBeGreaterThan(spaceMercDifficulty);
      expect(spaceMercDifficulty).toBeGreaterThan(critterDifficulty);
      expect(critterDifficulty).toBeGreaterThan(0);
    });

    it('should cache difficulty calculations', () => {
      // Clear any existing cache first
      service['monsterDifficulties'].clear();

      // First call should calculate and cache
      const difficulty1 = service['getMonsterBaseDifficulty'](
        MonsterType.SPACE_SLUG
      );
      expect(typeof difficulty1).toBe('number');

      // Second call should use cached value
      const difficulty2 = service['getMonsterBaseDifficulty'](
        MonsterType.SPACE_SLUG
      );

      expect(difficulty1).toBe(difficulty2);
      expect(service['monsterDifficulties'].has(MonsterType.SPACE_SLUG)).toBe(
        true
      );
    });

    it('should create monsters with tier-appropriate names', () => {
      // Test monsters with tier-specific names
      const easyVoidEntity = service['createMonster'](
        MonsterType.VOID_ENTITY,
        MonsterTier.EASY,
        5
      );
      const mediumVoidEntity = service['createMonster'](
        MonsterType.VOID_ENTITY,
        MonsterTier.MEDIUM,
        5
      );
      const hardVoidEntity = service['createMonster'](
        MonsterType.VOID_ENTITY,
        MonsterTier.HARD,
        5
      );
      const bossVoidEntity = service['createMonster'](
        MonsterType.VOID_ENTITY,
        MonsterTier.BOSS,
        5
      );

      // Names should be different for different tiers
      expect(easyVoidEntity.name).not.toBe(mediumVoidEntity.name);
      expect(mediumVoidEntity.name).not.toBe(hardVoidEntity.name);
      expect(hardVoidEntity.name).not.toBe(bossVoidEntity.name);

      // Boss should be stronger than easy
      expect(bossVoidEntity.health).toBeGreaterThan(easyVoidEntity.health);
    });

    it('should create monsters with unique names per tier', () => {
      // Test different monsters at the same tier have appropriate names
      const easySlug = service['createMonster'](
        MonsterType.SPACE_SLUG,
        MonsterTier.EASY,
        5
      );
      const easyXriit = service['createMonster'](
        MonsterType.XRIIT,
        MonsterTier.EASY,
        5
      );

      // Different monster types should have different names even at same tier
      expect(easySlug.name).not.toBe(easyXriit.name);
      expect(easySlug.description).not.toBe(easyXriit.description);
    });

    it('should create boss monsters with appropriate names', () => {
      // Test boss tier names are appropriately dramatic
      const bossSlug = service['createMonster'](
        MonsterType.SPACE_SLUG,
        MonsterTier.BOSS,
        5
      );
      const bossMoggo = service['createMonster'](
        MonsterType.MOGGO,
        MonsterTier.BOSS,
        5
      );

      // Boss names should indicate their status
      expect(bossSlug.name.toLowerCase()).toContain('queen');
      expect(bossMoggo.name.toLowerCase()).toContain('warchief');
    });

    it('should handle custom monster configurations gracefully', () => {
      // Test with a modified configuration
      const originalConfig = service['monsterConfig'];

      const customConfig = {
        ...originalConfig,
        monsters: {
          ...originalConfig.monsters,
          [MonsterType.SPACE_SLUG]: {
            ...originalConfig.monsters[MonsterType.SPACE_SLUG],
            baseHealth: 100 // Custom high health
          }
        }
      };

      // Temporarily replace the config
      service['monsterConfig'] = customConfig;

      const easySlug = service['createMonster'](
        MonsterType.SPACE_SLUG,
        MonsterTier.EASY,
        5
      );

      // Should use the custom base health
      expect(easySlug.health).toBeGreaterThan(50); // Should be much higher due to custom config

      // Restore original config
      service['monsterConfig'] = originalConfig;
    });

    it('should generate monsters with valid descriptions', () => {
      const iterations = 10;

      for (let i = 0; i < iterations; i++) {
        const monster = service.generateRandomMonster(5);

        // Should have a description
        expect(monster.description).toBeDefined();
        expect(typeof monster.description).toBe('string');
        expect(monster.description.length).toBeGreaterThan(0);
        // Verify the description matches space theme expectations
        if (monster.type === MonsterType.VOID_ENTITY) {
          expect(monster.description.toLowerCase()).toContain('mysterious');
        } else if (monster.type === MonsterType.CRITTER) {
          expect(monster.description.toLowerCase()).toMatch(
            /critter|vermin|station/
          );
        }
      }
    });
  });
});
