import { TestBed } from '@angular/core/testing';
import { QuestDomainService } from './quest-domain.service';
import { Hero } from '../../hero/models/hero.model';

describe('QuestDomainService', () => {
  let service: QuestDomainService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuestDomainService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  describe('calculateQuestOutcome', () => {
    it('should return quest result with success status and message', () => {      const hero: Hero = {
        name: 'Test Hero',
        health: 100,
        attack: 12,
        defense: 8,
        luck: 5,
        level: 1,
        experience: 0,
        gold: 0
      };

      const result = service.calculateQuestOutcome(hero);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('experienceGained');
      expect(result).toHaveProperty('goldGained');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.message).toBe('string');
      expect(typeof result.experienceGained).toBe('number');
      expect(typeof result.goldGained).toBe('number');
    });

    it('should award more rewards for successful quests', () => {      const hero: Hero = {
        name: 'Test Hero',
        health: 1000, // High stats to ensure success
        attack: 100,
        defense: 100,
        luck: 50,
        level: 10,
        experience: 500,
        gold: 1000
      };

      // Run multiple times to account for randomness
      let successfulQuests = 0;
      let totalExperience = 0;
      let totalGold = 0;
      const attempts = 100;

      for (let i = 0; i < attempts; i++) {
        const result = service.calculateQuestOutcome(hero);
        if (result.success) {
          successfulQuests++;
          totalExperience += result.experienceGained;
          totalGold += result.goldGained;
        }
      }

      // With max stats, should succeed most of the time
      expect(successfulQuests).toBeGreaterThan(attempts * 0.8);
      if (successfulQuests > 0) {
        expect(totalExperience / successfulQuests).toBeGreaterThan(0);
        expect(totalGold / successfulQuests).toBeGreaterThan(0);
      }
    });
  });
});
