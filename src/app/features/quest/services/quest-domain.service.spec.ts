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
  beforeEach(() => {    // Create Jest spy objects instead of Jasmine spies
    const monsterSpy = {
      generateRandomMonster: jest.fn(),
      calculateMonsterInstanceDifficulty: jest.fn(),
      generateMultiMonsterEncounter: jest.fn()
    };
      const combatSpy = {
      createTeamCombat: jest.fn()
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
      type: MonsterType.SPACE_SLUG,
      name: 'Test Space Slug',
      health: 30,
      maxHealth: 30,
      attack: 8,
      defense: 5,
      speed: 5,
      experienceReward: 20,
      description: 'A test space slug'
    };    
    monsterServiceSpy.generateRandomMonster.mockReturnValue(mockMonster);
    
    // Mock the generateMultiMonsterEncounter method
    monsterServiceSpy.generateMultiMonsterEncounter.mockReturnValue([mockMonster]);
    
    // Mock the calculateMonsterInstanceDifficulty method
    monsterServiceSpy.calculateMonsterInstanceDifficulty.mockReturnValue(20.5);
    
    const mockCombatResult: CombatResult = {
      outcome: CombatOutcome.HERO_VICTORY,
      turns: [],
      experienceGained: 20,
      summary: 'Test combat summary'
    };
    
    combatServiceSpy.createTeamCombat.mockReturnValue(mockCombatResult);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
    describe('Quest Generation System', () => {it('should create quest context with appropriate properties', () => {
      const hero: Hero = {
        name: 'Test Hero',
        health: 100,
        maxHealth: 100,
        attack: 12,
        defense: 8,
        luck: 5,
        speed: 8,
        level: 1,
        experience: 0
      };

      const context = service.createQuestContext(hero);      expect(context).toHaveProperty('remainingStepTypes');      expect(context).toHaveProperty('questStatus');
      expect(context).toHaveProperty('currentStepIndex');
      expect(context).toHaveProperty('accumulatedGoo');
      expect(context).toHaveProperty('accumulatedMetal');
      
      // Should have between 2-5 steps
      expect(context.remainingStepTypes.length).toBeGreaterThanOrEqual(2);
      expect(context.remainingStepTypes.length).toBeLessThanOrEqual(5);
      expect(context.questStatus).toBe('ongoing');
      expect(context.currentStepIndex).toBe(0);
      expect(context.accumulatedGoo).toBe(0);
      expect(context.accumulatedMetal).toBe(0);
    });    it('should generate steps with appropriate properties using dynamic generation', () => {
      const hero: Hero = {
        name: 'Test Hero',
        health: 100,
        maxHealth: 100,
        attack: 12,
        defense: 8,
        luck: 5,
        speed: 15,
        level: 1,
        experience: 0
      };

      const context = service.createQuestContext(hero);
      const steps: any[] = [];
      
      // Generate all steps dynamically
      while (context.remainingStepTypes.length > 0) {
        const step = service.generateNextStep(hero, context);
        if (step) {
          steps.push(step);
        }
      }
      
      // Check that each step has the required properties
      steps.forEach(step => {        expect(step).toHaveProperty('type');
        expect(step).toHaveProperty('message');
        expect(step).toHaveProperty('success');
        expect(step).toHaveProperty('timestamp');
        expect(step).toHaveProperty('experienceGained');
        
        // Verify step type is one of the valid types
        expect([
          QuestStepType.EXPLORATION, 
          QuestStepType.ENCOUNTER, 
          QuestStepType.TREASURE
        ]).toContain(step.type);
      });
    });    it('should generate quest with better outcomes for high-stat heroes', () => {
      const highStatHero: Hero = {
        name: 'Powerful Hero',
        health: 1000, // High stats to ensure success
        maxHealth: 1000,
        attack: 100,
        defense: 100,
        luck: 50,
        speed: 30,
        level: 10,
        experience: 500
      };

      // Run multiple times to account for randomness
      let successfulQuests = 0;
      let totalExperience = 0;
      const attempts = 50;

      for (let i = 0; i < attempts; i++) {
        const context = service.createQuestContext(highStatHero);
        const steps: any[] = [];        
        // Generate all steps
        while (context.remainingStepTypes.length > 0) {
          const step = service.generateNextStep(highStatHero, context);
          if (step) {
            steps.push(step);
          }        }
        
        if (context.questStatus === 'successful') {
          successfulQuests++;
          totalExperience += steps.reduce((sum, step) => sum + step.experienceGained, 0);
        }
      }

      // With max stats, should succeed most of the time
      expect(successfulQuests).toBeGreaterThan(attempts * 0.7);
      if (successfulQuests > 0) {
        expect(totalExperience / successfulQuests).toBeGreaterThan(0);
      }
    });    it('should generate appropriate messages for different step types', () => {
      const hero: Hero = {
        name: 'Test Hero',
        health: 1000, // High stats to ensure success
        maxHealth: 1000,
        attack: 100,
        defense: 100,
        luck: 50,
        speed: 30,
        level: 10,
        experience: 500
      };
      
      // Run multiple quests to ensure we get different step types
      const stepMessages = {
        [QuestStepType.EXPLORATION]: new Set<string>(),
        [QuestStepType.ENCOUNTER]: new Set<string>(),
        [QuestStepType.TREASURE]: new Set<string>()
      };
      
      for (let i = 0; i < 10; i++) {
        const context = service.createQuestContext(hero);
          // Generate all steps
        while (context.remainingStepTypes.length > 0) {
          const step = service.generateNextStep(hero, context);
          if (step && step.type in stepMessages) {
            stepMessages[step.type as keyof typeof stepMessages].add(step.message);
          }
        }
      }
      
      // Verify we got messages for each step type
      expect(stepMessages[QuestStepType.EXPLORATION].size).toBeGreaterThan(0);
      expect(stepMessages[QuestStepType.ENCOUNTER].size).toBeGreaterThan(0);
      expect(stepMessages[QuestStepType.TREASURE].size).toBeGreaterThan(0);
    });    it('should include combat data for encounter steps', () => {
      const hero: Hero = {
        name: 'Test Hero',
        health: 100,
        maxHealth: 100,
        attack: 12,
        defense: 8,
        luck: 5,
        speed: 15,
        level: 1,
        experience: 0
      };

      const context = service.createQuestContext(hero);
      const steps: any[] = [];
      
      // Generate all steps
      while (context.remainingStepTypes.length > 0) {
        const step = service.generateNextStep(hero, context);
        if (step) {
          steps.push(step);
        }
      }
      
      // Find encounter steps
      const encounterSteps = steps.filter(step => step.type === QuestStepType.ENCOUNTER);
      
      // If there are encounter steps, they should have monster and combat data
      if (encounterSteps.length > 0) {
        encounterSteps.forEach(step => {
          expect(step.monster).toBeDefined();
          expect(step.combatResult).toBeDefined();
            if (step.monster && step.combatResult) {
            expect(monsterServiceSpy.generateMultiMonsterEncounter).toHaveBeenCalled();
            expect(combatServiceSpy.createTeamCombat).toHaveBeenCalled();
            
            // Verify combat rewards match step rewards
            expect(step.experienceGained).toBe(step.combatResult.experienceGained);
            expect(step.goldGained).toBe(step.combatResult.goldGained);
          }
        });
      }
    });    it('should return null when no more steps remain in context', () => {
      const hero: Hero = {
        name: 'Test Hero',
        health: 100,
        maxHealth: 100,
        attack: 12,
        defense: 8,
        luck: 5,
        speed: 15,
        level: 1,
        experience: 0
      };

      const context = service.createQuestContext(hero);
      
      // Generate all steps until none remain
      while (context.remainingStepTypes.length > 0) {
        service.generateNextStep(hero, context);
      }
      
      // Next call should return null
      const step = service.generateNextStep(hero, context);
      expect(step).toBeNull();
    });
  });
});
