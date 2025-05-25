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

  describe('simulateCombat', () => {    it('should simulate complete combat and return valid result', () => {
      const hero: Hero = {
        name: 'Test Hero',
        health: 100,
        maxHealth: 100,
        attack: 15,
        defense: 10,
        luck: 5,
        level: 3,
        experience: 100,
        gold: 50
      };

      const monster: Monster = {
        type: MonsterType.GOBLIN,
        name: 'Goblin',
        health: 30,
        maxHealth: 30,
        attack: 8,
        defense: 5,
        experienceReward: 20,
        goldReward: 10,
        description: 'A small, green-skinned creature.'
      };

      const result = service.simulateCombat(hero, monster);      // Result should have required properties
      expect(result).toHaveProperty('outcome');
      expect(result).toHaveProperty('turns');
      expect(result).toHaveProperty('experienceGained');
      expect(result).toHaveProperty('goldGained');
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
        level: 10,
        experience: 500,
        gold: 1000
      };

      // Setup a very weak monster
      const weakMonster: Monster = {
        type: MonsterType.GOBLIN,
        name: 'Weak Goblin',
        health: 10,
        maxHealth: 10,
        attack: 5,
        defense: 2,
        experienceReward: 20,
        goldReward: 15,
        description: 'A small, weak goblin.'
      };

      const victoryResult = service.simulateCombat(strongHero, weakMonster);
      
      // Strong hero should win
      expect(victoryResult.outcome).toBe(CombatOutcome.HERO_VICTORY);
      
      // Should get full rewards
      expect(victoryResult.experienceGained).toBe(weakMonster.experienceReward);
      expect(victoryResult.goldGained).toBe(weakMonster.goldReward);      // Setup a very weak hero for guaranteed defeat
      const weakHero: Hero = {
        name: 'Weak Hero',
        health: 20,
        maxHealth: 20,
        attack: 5,
        defense: 3,
        luck: 1,
        level: 1,
        experience: 0,
        gold: 10
      };

      // Setup a very strong monster
      const strongMonster: Monster = {
        type: MonsterType.DRAGON,
        name: 'Strong Dragon',
        health: 200,
        maxHealth: 200,
        attack: 40,
        defense: 30,
        experienceReward: 100,
        goldReward: 200,
        description: 'A powerful dragon.'
      };

      const defeatResult = service.simulateCombat(weakHero, strongMonster);
      
      // Weak hero should lose
      expect([CombatOutcome.HERO_DEFEAT, CombatOutcome.HERO_FLED]).toContain(defeatResult.outcome);
      
      // If defeated, should get reduced or no rewards
      if (defeatResult.outcome === CombatOutcome.HERO_DEFEAT) {
        expect(defeatResult.experienceGained).toBeLessThan(strongMonster.experienceReward);
        expect(defeatResult.goldGained).toBe(0);
      }
    });
  });
});
