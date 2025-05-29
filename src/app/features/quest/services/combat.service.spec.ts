import { TestBed } from '@angular/core/testing';
import { CombatService } from './combat.service';
import { CombatOrchestrator } from './combat-orchestrator.service';
import { TurnManager } from './turn-manager.service';
import { CombatAI } from './combat-ai.service';
import { CombatStateManager } from './combat-state-manager.service';
import { ActionExecutor } from './action-executor.service';
import { EntityConverter } from './entity-converter.service';
import { ActionFactory } from './actions/action.factory';
import { Hero } from '../../hero/models/hero.model';
import { Monster, MonsterType } from '../models/monster.model';
import { CombatOutcome } from '../models/combat.model';

describe('CombatService', () => {
  let service: CombatService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CombatService,
        CombatOrchestrator,
        TurnManager,
        CombatAI,
        CombatStateManager,
        ActionExecutor,
        EntityConverter,
        ActionFactory
      ]
    });
    service = TestBed.inject(CombatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Team-based Combat', () => {
    it('should simulate combat between multiple combatants', () => {
      const heroTeam: Hero[] = [{
        name: 'Test Hero',
        health: 100,
        maxHealth: 100,
        attack: 15,
        defense: 10,
        luck: 10,
        speed: 12,
        level: 5,
        experience: 100
      }];

      const enemyTeam: Monster[] = [{
        type: MonsterType.CRITTER,
        name: 'Test Monster',
        health: 50,
        maxHealth: 50,
        attack: 8,
        defense: 5,
        speed: 10,
        experienceReward: 20,
        description: 'A test monster for combat simulation.'
      }];

      const result = service.createTeamCombat(heroTeam, enemyTeam);      // Should have a valid result
      expect(result).toBeDefined();
      expect(typeof result.outcome).toBe('string');
      expect(result.turns).toBeInstanceOf(Array);
      expect(result.turns.length).toBeGreaterThan(0);
      expect(result.experienceGained).toBeGreaterThanOrEqual(0);
      expect(typeof result.summary).toBe('string');
      
      // Should have one of the valid outcomes
      expect([
        CombatOutcome.HERO_VICTORY, 
        CombatOutcome.HERO_DEFEAT, 
        CombatOutcome.HERO_FLED
      ]).toContain(result.outcome);
    });

    it('should give full rewards for victory and reduced rewards for defeat', () => {
      // Setup a very strong hero for guaranteed victory
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

      const victoryResult = service.createTeamCombat([strongHero], [weakMonster]);
      
      // Strong hero should win
      expect(victoryResult.outcome).toBe(CombatOutcome.HERO_VICTORY);
      // Should get experience rewards (calculated from enemy stats)
      expect(victoryResult.experienceGained).toBeGreaterThan(0);

      // Setup a very weak hero for guaranteed defeat
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

      const defeatResult = service.createTeamCombat([weakHero], [strongMonster]);
      
      // Weak hero should lose
      expect([CombatOutcome.HERO_DEFEAT, CombatOutcome.HERO_FLED]).toContain(defeatResult.outcome);
      // If defeated, should get no experience (only defeated enemies give experience)
      if (defeatResult.outcome === CombatOutcome.HERO_DEFEAT) {
        expect(defeatResult.experienceGained).toBe(0);
      }
    });
  });

  describe('Combat System Architecture', () => {
    it('should handle multiple heroes vs multiple monsters', () => {
      const heroes: Hero[] = [
        {
          name: 'Hero One',
          health: 80,
          maxHealth: 80,
          attack: 12,
          defense: 8,
          luck: 10,
          speed: 10,
          level: 3,
          experience: 50
        },
        {
          name: 'Hero Two',
          health: 70,
          maxHealth: 70,
          attack: 10,
          defense: 12,
          luck: 8,
          speed: 14,
          level: 2,
          experience: 30
        }
      ];

      const monsters: Monster[] = [
        {
          type: MonsterType.SPACE_SLUG,
          name: 'Slug Alpha',
          health: 40,
          maxHealth: 40,
          attack: 8,
          defense: 6,
          speed: 8,
          experienceReward: 15,
          description: 'A space slug.'
        },
        {
          type: MonsterType.MOGGO,
          name: 'Moggo Beta',
          health: 60,
          maxHealth: 60,
          attack: 12,
          defense: 4,
          speed: 6,
          experienceReward: 25,
          description: 'A moggo warrior.'
        }
      ];

      const result = service.createTeamCombat(heroes, monsters);

      expect(result).toBeDefined();
      expect(result.turns.length).toBeGreaterThan(0);
      
      // Should track all combatants in turn data
      const firstTurn = result.turns[0];
      expect(firstTurn.allCombatantsHealth).toBeDefined();
      expect(firstTurn.allCombatantsHealth!.length).toBe(4); // 2 heroes + 2 monsters
    });

    it('should provide detailed turn information', () => {
      const hero: Hero = {
        name: 'Detail Hero',
        health: 100,
        maxHealth: 100,
        attack: 15,
        defense: 10,
        luck: 10,
        speed: 12,
        level: 5,
        experience: 100
      };

      const monster: Monster = {
        type: MonsterType.CRITTER,
        name: 'Detail Monster',
        health: 30,
        maxHealth: 30,
        attack: 8,
        defense: 5,
        speed: 10,
        experienceReward: 15,
        description: 'A detailed monster for testing.'
      };

      const result = service.createTeamCombat([hero], [monster]);

      expect(result.turns.length).toBeGreaterThan(0);
      
      const firstTurn = result.turns[0];
      expect(firstTurn.turnNumber).toBe(1);
      expect(firstTurn.actorId).toBeDefined();
      expect(firstTurn.action).toBeDefined();
      expect(firstTurn.action.type).toBeDefined();
      expect(firstTurn.action.description).toBeDefined();
      expect(firstTurn.action.actorName).toBeDefined();
      expect(firstTurn.action.targetName).toBeDefined();
      expect(typeof firstTurn.action.success).toBe('boolean');
      expect(firstTurn.actorHealthAfter).toBeGreaterThanOrEqual(0);
      expect(firstTurn.targetHealthAfter).toBeGreaterThanOrEqual(0);
    });
  });
});
