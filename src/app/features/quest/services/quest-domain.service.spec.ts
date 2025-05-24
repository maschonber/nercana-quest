import { TestBed } from '@angular/core/testing';
import { QuestDomainService } from './quest-domain.service';
import { MonsterService } from './monster.service';
import { CombatService } from './combat.service';
import { Hero } from '../../hero/models/hero.model';
import { QuestStepType } from '../models/quest.model';
import { CombatOutcome, CombatResult } from '../models/combat.model';
import { Monster, MonsterType } from '../models/monster.model';

describe('QuestDomainService', () => {
  let service: QuestDomainService;
  let monsterServiceSpy: any;
  let combatServiceSpy: any;
  beforeEach(() => {
    // Create Jest spy objects instead of Jasmine spies
    const monsterSpy = {
      generateRandomMonster: jest.fn()
    };
    
    const combatSpy = {
      simulateCombat: jest.fn()
    };
    
    TestBed.configureTestingModule({
      providers: [
        QuestDomainService,
        { provide: MonsterService, useValue: monsterSpy },
        { provide: CombatService, useValue: combatSpy }
      ]
    });
    
    service = TestBed.inject(QuestDomainService);
    monsterServiceSpy = TestBed.inject(MonsterService);
    combatServiceSpy = TestBed.inject(CombatService);
      // Setup default return values for spies
    const mockMonster: Monster = {
      type: MonsterType.GOBLIN,
      name: 'Test Goblin',
      health: 30,
      maxHealth: 30,
      attack: 8,
      defense: 5,
      experienceReward: 20,
      goldReward: 10,
      description: 'A test goblin'
    };
    
    monsterServiceSpy.generateRandomMonster.mockReturnValue(mockMonster);
      const mockCombatResult: CombatResult = {
      outcome: CombatOutcome.HERO_VICTORY,
      turns: [],
      experienceGained: 20,
      goldGained: 10,
      summary: 'Test combat summary'
    };
    
    combatServiceSpy.simulateCombat.mockReturnValue(mockCombatResult);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  
  describe('calculateQuestOutcome', () => {
    it('should return quest result with success status, message, and steps', () => {
      const hero: Hero = {
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
      expect(result).toHaveProperty('steps');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.message).toBe('string');
      expect(typeof result.experienceGained).toBe('number');
      expect(typeof result.goldGained).toBe('number');
      expect(Array.isArray(result.steps)).toBe(true);
      
      // Should have between 2-5 steps
      expect(result.steps.length).toBeGreaterThanOrEqual(2);
      expect(result.steps.length).toBeLessThanOrEqual(5);
    });
    
    it('should create steps with appropriate properties', () => {
      const hero: Hero = {
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
      
      // Check that each step has the required properties
      result.steps.forEach(step => {
        expect(step).toHaveProperty('type');
        expect(step).toHaveProperty('message');
        expect(step).toHaveProperty('success');
        expect(step).toHaveProperty('timestamp');
        expect(step).toHaveProperty('experienceGained');
        expect(step).toHaveProperty('goldGained');
        
        // Verify step type is one of the valid types
        expect([
          QuestStepType.EXPLORATION, 
          QuestStepType.ENCOUNTER, 
          QuestStepType.TREASURE
        ]).toContain(step.type);
      });
    });

    it('should award more rewards for successful quests', () => {
      const hero: Hero = {
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
    
    it('should generate appropriate messages for different step types', () => {
      const hero: Hero = {
        name: 'Test Hero',
        health: 1000, // High stats to ensure success
        attack: 100,
        defense: 100,
        luck: 50,
        level: 10,
        experience: 500,
        gold: 1000
      };
      
      // Run multiple quests to ensure we get different step types
      const stepMessages = {
        [QuestStepType.EXPLORATION]: new Set<string>(),
        [QuestStepType.ENCOUNTER]: new Set<string>(),
        [QuestStepType.TREASURE]: new Set<string>()
      };
      
      for (let i = 0; i < 10; i++) {
        const result = service.calculateQuestOutcome(hero);
        
        result.steps.forEach(step => {
          stepMessages[step.type].add(step.message);
        });
      }
      
      // Verify we got messages for each step type
      expect(stepMessages[QuestStepType.EXPLORATION].size).toBeGreaterThan(0);
      expect(stepMessages[QuestStepType.ENCOUNTER].size).toBeGreaterThan(0);
      expect(stepMessages[QuestStepType.TREASURE].size).toBeGreaterThan(0);
    });
    
    it('should include combat data for encounter steps', () => {
      const hero: Hero = {
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
      
      // Find encounter steps
      const encounterSteps = result.steps.filter(step => step.type === QuestStepType.ENCOUNTER);
      
      // If there are encounter steps, they should have monster and combat data
      if (encounterSteps.length > 0) {
        encounterSteps.forEach(step => {
          expect(step.monster).toBeDefined();
          expect(step.combatResult).toBeDefined();
          
          if (step.monster && step.combatResult) {
            expect(monsterServiceSpy.generateRandomMonster).toHaveBeenCalled();
            expect(combatServiceSpy.simulateCombat).toHaveBeenCalled();
            
            // Verify combat rewards match step rewards
            expect(step.experienceGained).toBe(step.combatResult.experienceGained);
            expect(step.goldGained).toBe(step.combatResult.goldGained);
          }
        });
      }
    });
  });
});
