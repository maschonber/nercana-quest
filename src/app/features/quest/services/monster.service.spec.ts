import { TestBed } from '@angular/core/testing';
import { MonsterService } from './monster.service';
import { MonsterTier } from '../models/monster.model';

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
    });

    it('should scale monster difficulty with hero level', () => {
      const lowLevelMonster = service.generateRandomMonster(1);
      const highLevelMonster = service.generateRandomMonster(10);

      // Higher level monsters should generally be stronger
      expect(highLevelMonster.health).toBeGreaterThan(lowLevelMonster.health);
      expect(highLevelMonster.attack).toBeGreaterThan(lowLevelMonster.attack);
      expect(highLevelMonster.experienceReward).toBeGreaterThan(lowLevelMonster.experienceReward);
    });
  });
});
