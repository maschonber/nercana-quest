import { TestBed } from '@angular/core/testing';
import { CombatService } from './combat.service';
import { Hero } from '../../hero/models/hero.model';
import { Monster, MonsterType } from '../models/monster.model';
import { CombatOutcome } from '../models/combat.model';

describe('CombatService', () => {
  let service: CombatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CombatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('simulateCombat', () => {
    it('should simulate complete combat and return valid result', () => {      const hero: Hero = {
        name: 'Test Hero',
        health: 100,
        maxHealth: 100,
        attack: 15,
        defense: 10,
        luck: 5,
        speed: 8,
        level: 3,
        experience: 100
      };

      const monster: Monster = {
        type: MonsterType.SPACE_SLUG,
        name: 'Space Slug',
        health: 30,
        maxHealth: 30,
        attack: 8,
        defense: 5,
        speed: 5,
        experienceReward: 20,
        description: 'A slimy space creature that feeds on asteroids.'
      };

      const result = service.simulateCombat(hero, monster);
      
      // Result should have required properties
      expect(result).toHaveProperty('outcome');      expect(result).toHaveProperty('turns');
      expect(result).toHaveProperty('experienceGained');
      expect(result).toHaveProperty('summary');

      // Combat should have ended (not IN_PROGRESS)
      expect(result.outcome).not.toBe(CombatOutcome.IN_PROGRESS);
      
      // Should have at least one turn
      expect(result.turns.length).toBeGreaterThan(0);
      
      // Each turn should have the required properties
      result.turns.forEach(turn => {
        expect(turn).toHaveProperty('turnNumber');
        expect(turn).toHaveProperty('actor');
        expect(turn).toHaveProperty('action');
        expect(turn).toHaveProperty('heroHealthAfter');
        expect(turn).toHaveProperty('monsterHealthAfter');
      });
    });

    it('should give full rewards for victory and reduced rewards for defeat', () => {      // Setup a very strong hero for guaranteed victory
      const strongHero: Hero = {
        name: 'Strong Hero',
        health: 200,
        maxHealth: 200,
        attack: 50,
        defense: 30,
        luck: 20,
        speed: 12,
        level: 10,
        experience: 500
      };

      // Setup a very weak monster
      const weakMonster: Monster = {
        type: MonsterType.CRITTER,
        name: 'Weak Critter',
        health: 10,
        maxHealth: 10,
        attack: 5,
        defense: 2,
        speed: 12,
        experienceReward: 20,
        description: 'A small, weak space critter.'
      };

      const victoryResult = service.simulateCombat(strongHero, weakMonster);
      
      // Strong hero should win
      expect(victoryResult.outcome).toBe(CombatOutcome.HERO_VICTORY);
      
      // Should get experience rewards
      expect(victoryResult.experienceGained).toBe(weakMonster.experienceReward);      // Setup a very weak hero for guaranteed defeat
      const weakHero: Hero = {
        name: 'Weak Hero',
        health: 20,
        maxHealth: 20,
        attack: 5,
        defense: 3,
        luck: 1,
        speed: 6,
        level: 1,
        experience: 0
      };

      // Setup a very strong monster
      const strongMonster: Monster = {
        type: MonsterType.VOID_ENTITY,
        name: 'Strong Void Entity',
        health: 200,
        maxHealth: 200,
        attack: 40,
        defense: 30,
        speed: 14,
        experienceReward: 100,
        description: 'A powerful void entity from another dimension.'
      };

      const defeatResult = service.simulateCombat(weakHero, strongMonster);
      
      // Weak hero should lose
      expect([CombatOutcome.HERO_DEFEAT, CombatOutcome.HERO_FLED]).toContain(defeatResult.outcome);
      
      // If defeated, should get reduced experience
      if (defeatResult.outcome === CombatOutcome.HERO_DEFEAT) {
        expect(defeatResult.experienceGained).toBeLessThan(strongMonster.experienceReward);
      }
    });
  });
});
