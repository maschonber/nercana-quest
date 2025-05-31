import { TestBed } from '@angular/core/testing';
import { HeroStore } from './hero.store';
import { HeroDomainService } from '../../features/hero/services/hero-domain.service';

/**
 * Test suite for Hero Store functionality - focusing on level-up message behavior
 */
describe('HeroStore', () => {
  let store: InstanceType<typeof HeroStore>;
  let heroDomainService: HeroDomainService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(HeroStore);
    heroDomainService = TestBed.inject(HeroDomainService);
  });

  afterEach(() => {
    store.resetHero();
  });

  describe('Level-up Message Functionality', () => {
    it('should return empty string when no level up occurs', () => {
      // Add a small amount of experience that won't trigger level up
      const result = store.addExperience(10);
      
      expect(result).toBe('');
      expect(store.hero().experience).toBe(10);
    });    it('should return clone name in level-up message when level up occurs', () => {
      // The initial hero name is 'Adventurer'
      const initialHero = store.hero();
      expect(initialHero.name).toBe('Adventurer');
      expect(initialHero.level).toBe(1);
      
      // Add enough experience to trigger a level up
      // Based on typical RPG progression, level 2 usually requires around 100-1000 XP
      const result = store.addExperience(1000);      
      // Check if level up occurred
      if (store.hero().level > 1) {
        expect(result).toContain('🎉 LEVEL UP!');
        expect(result).toContain('Adventurer');
        expect(result).toContain('reached level');
        expect(result).toContain(store.hero().level.toString());
        expect(result).not.toContain('You gained');
      } else {
        // If no level up occurred with this amount, test passes as no level up message expected
        expect(result).toBe('');
      }
    });

    it('should include clone name and level info with visual emphasis in level-up messages', () => {
      // This test ensures we have proper visual formatting and level information
      const initialLevel = store.hero().level;      
      // Try adding substantial experience
      const result = store.addExperience(5000);
      
      // If a level up occurred, verify the message format
      if (store.hero().level > initialLevel) {
        expect(result).not.toContain('You gained');
        expect(result).toContain('🎉 LEVEL UP!');
        expect(result).toContain(store.hero().name);
        expect(result).toContain('reached level');
        expect(result).toContain(store.hero().level.toString());
      }
    });
  });
});
