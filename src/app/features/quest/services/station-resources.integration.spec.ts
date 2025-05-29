import { TestBed } from '@angular/core/testing';
import { QuestDomainService } from './quest-domain.service';
import { MonsterService } from './monster.service';
import { CombatService, CombatOutcome } from '../../combat';
import { QuestStepType } from '../models/quest.model';
import { Hero } from '../../hero/models/hero.model';


/**
 * Integration tests for station resource generation in quest domain service
 */
describe('QuestDomainService - Station Resources Integration', () => {
  let service: QuestDomainService;
  let monsterService: jest.Mocked<MonsterService>;
  let combatService: jest.Mocked<CombatService>;  const testHero: Hero = {
    name: 'Test Hero',
    health: 100,
    maxHealth: 100,
    attack: 15,
    defense: 10,
    luck: 8,
    speed: 8,
    level: 3,
    experience: 150
  };

  beforeEach(() => {    const monsterServiceSpy = {
      generateRandomMonster: jest.fn(),
      calculateMonsterInstanceDifficulty: jest.fn(),
      generateMultiMonsterEncounter: jest.fn()
    };const combatServiceSpy = {
      createTeamCombat: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        QuestDomainService,
        { provide: MonsterService, useValue: monsterServiceSpy },
        { provide: CombatService, useValue: combatServiceSpy }
      ]
    });

    service = TestBed.inject(QuestDomainService);
    monsterService = TestBed.inject(MonsterService) as jest.Mocked<MonsterService>;
    combatService = TestBed.inject(CombatService) as jest.Mocked<CombatService>;
  });

  describe('Station Resource Generation', () => {    it('should accumulate goo from successful encounters', () => {      // Mock successful combat for encounter steps
      const mockMonster = {
        name: 'Test Monster',
        type: 'SPACE_SLUG' as any,
        description: 'A test monster',
        health: 30,
        maxHealth: 30,
        attack: 10,
        defense: 5,
        speed: 5,
        experienceReward: 25
      };
      
      monsterService.generateRandomMonster.mockReturnValue(mockMonster);
      
      // Mock the generateMultiMonsterEncounter method
      monsterService.generateMultiMonsterEncounter.mockReturnValue([mockMonster]);

      // Mock the calculateMonsterInstanceDifficulty method      monsterService.calculateMonsterInstanceDifficulty.mockReturnValue(20.5);

      combatService.createTeamCombat.mockReturnValue({
        outcome: CombatOutcome.HERO_VICTORY,
        turns: [],
        experienceGained: 25,
        summary: 'Victory!'
      });

      // Create context and force encounter step
      const context = service.createQuestContext(testHero);
      context.remainingStepTypes = [QuestStepType.ENCOUNTER];
      
      const initialGoo = context.accumulatedGoo;
      const step = service.generateNextStep(testHero, context);
      
      expect(step).toBeTruthy();
      expect(step!.success).toBe(true);
      expect(context.accumulatedGoo).toBeGreaterThan(initialGoo);
    });

    it('should accumulate metal from treasure steps', () => {
      // Create context and force treasure step
      const context = service.createQuestContext(testHero);
      context.remainingStepTypes = [QuestStepType.TREASURE];
      
      const initialMetal = context.accumulatedMetal;
      const step = service.generateNextStep(testHero, context);
      
      expect(step).toBeTruthy();
      expect(step!.success).toBe(true);
      expect(context.accumulatedMetal).toBeGreaterThan(initialMetal);
    });    it('should not accumulate resources from failed encounters', () => {      // Mock failed combat for encounter steps
      const mockMonster = {
        name: 'Test Monster',
        type: 'SPACE_SLUG' as any,
        description: 'A test monster',
        health: 30,
        maxHealth: 30,
        attack: 10,
        defense: 5,
        speed: 12,
        experienceReward: 25
      };
      
      monsterService.generateRandomMonster.mockReturnValue(mockMonster);
      
      // Mock the generateMultiMonsterEncounter method
      monsterService.generateMultiMonsterEncounter.mockReturnValue([mockMonster]);

      // Mock the calculateMonsterInstanceDifficulty method
      monsterService.calculateMonsterInstanceDifficulty.mockReturnValue(20.5);      combatService.createTeamCombat.mockReturnValue({
        outcome: CombatOutcome.HERO_DEFEAT,
        turns: [],
        experienceGained: 0,
        summary: 'Defeat!'
      });

      // Create context and force encounter step
      const context = service.createQuestContext(testHero);
      context.remainingStepTypes = [QuestStepType.ENCOUNTER];
      
      const initialGoo = context.accumulatedGoo;
      const step = service.generateNextStep(testHero, context);
      
      expect(step).toBeTruthy();
      expect(step!.success).toBe(false);
      expect(context.accumulatedGoo).toBe(initialGoo); // No change in goo
    });    it('should scale resources with hero level', () => {
      const lowLevelHero: Hero = { ...testHero, level: 1 };
      const highLevelHero: Hero = { ...testHero, level: 10 };

      // Mock successful combat
      const mockMonster = {
        name: 'Test Monster',
        type: 'SPACE_SLUG' as any,
        description: 'A test monster',
        health: 30,
        maxHealth: 30,
        attack: 10,
        defense: 5,
        speed: 12,
        experienceReward: 25
      };
      
      monsterService.generateRandomMonster.mockReturnValue(mockMonster);
      
      // Mock the generateMultiMonsterEncounter method
      monsterService.generateMultiMonsterEncounter.mockReturnValue([mockMonster]);

      // Mock the calculateMonsterInstanceDifficulty method
      monsterService.calculateMonsterInstanceDifficulty.mockReturnValue(20.5);      combatService.createTeamCombat.mockReturnValue({
        outcome: CombatOutcome.HERO_VICTORY,
        turns: [],
        experienceGained: 25,
        summary: 'Victory!'
      });

      let lowLevelGoo = 0;
      let highLevelGoo = 0;

      // Generate multiple encounter steps for consistent results
      for (let i = 0; i < 10; i++) {
        // Low level hero
        const lowLevelContext = service.createQuestContext(lowLevelHero);
        lowLevelContext.remainingStepTypes = [QuestStepType.ENCOUNTER];
        const lowLevelStep = service.generateNextStep(lowLevelHero, lowLevelContext);
        if (lowLevelStep && lowLevelStep.success) {
          lowLevelGoo += lowLevelContext.accumulatedGoo;
        }

        // High level hero
        const highLevelContext = service.createQuestContext(highLevelHero);
        highLevelContext.remainingStepTypes = [QuestStepType.ENCOUNTER];
        const highLevelStep = service.generateNextStep(highLevelHero, highLevelContext);
        if (highLevelStep && highLevelStep.success) {
          highLevelGoo += highLevelContext.accumulatedGoo;
        }
      }

      // High level hero should get more goo overall
      expect(highLevelGoo).toBeGreaterThan(lowLevelGoo);
    });    it('should only award resources to station upon successful quest completion', () => {
      // Mock successful combat
      const mockMonster = {
        name: 'Test Monster',
        type: 'SPACE_SLUG' as any,
        description: 'A test monster',
        health: 30,
        maxHealth: 30,
        attack: 10,
        defense: 5,
        speed: 12,
        experienceReward: 25
      };
      
      monsterService.generateRandomMonster.mockReturnValue(mockMonster);
      
      // Mock the generateMultiMonsterEncounter method
      monsterService.generateMultiMonsterEncounter.mockReturnValue([mockMonster]);

      // Mock the calculateMonsterInstanceDifficulty method
      monsterService.calculateMonsterInstanceDifficulty.mockReturnValue(20.5);      combatService.createTeamCombat.mockReturnValue({
        outcome: CombatOutcome.HERO_VICTORY,
        turns: [],
        experienceGained: 25,
        summary: 'Victory!'
      });      // Create a quest with encounter and treasure steps
      const context = service.createQuestContext(testHero);
      context.remainingStepTypes = [QuestStepType.ENCOUNTER, QuestStepType.TREASURE];
      
      // Complete all steps successfully
      const steps = [];
      while (context.remainingStepTypes.length > 0) {
        const step = service.generateNextStep(testHero, context);
        expect(step).toBeTruthy();
        expect(step!.success).toBe(true);
        steps.push(step!);
      }

      // Generate final quest result
      const finalResult = service.createQuestResult(context, steps);
      
      expect(finalResult).toBeTruthy();
      expect(finalResult.questStatus).toBe('successful');
      expect(finalResult.gooGained).toBeGreaterThan(0);
      expect(finalResult.metalGained).toBeGreaterThan(0);
    });    it('should lose all accumulated resources on quest failure', () => {
      // Mock one successful encounter then one failed encounter
      let callCount = 0;
      const mockMonster = {
        name: 'Test Monster',
        type: 'SPACE_SLUG' as any,
        description: 'A test monster',
        health: 30,
        maxHealth: 30,
        attack: 10,
        defense: 5,
        speed: 12,
        experienceReward: 25
      };
      
      monsterService.generateRandomMonster.mockImplementation(() => mockMonster);
      
      // Mock the generateMultiMonsterEncounter method
      monsterService.generateMultiMonsterEncounter.mockReturnValue([mockMonster]);

      // Mock the calculateMonsterInstanceDifficulty method
      monsterService.calculateMonsterInstanceDifficulty.mockReturnValue(20.5);

      combatService.createTeamCombat.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            outcome: CombatOutcome.HERO_VICTORY,
            turns: [],
            experienceGained: 25,
            summary: 'Victory!'
          };
        } else {
          return {
            outcome: CombatOutcome.HERO_DEFEAT,
            turns: [],
            experienceGained: 0,
            summary: 'Defeat!'
          };
        }
      });      // Create a quest with multiple encounter steps
      const context = service.createQuestContext(testHero);
      context.remainingStepTypes = [QuestStepType.ENCOUNTER, QuestStepType.ENCOUNTER];
      
      const steps = [];
      
      // First step succeeds and accumulates goo
      const firstStep = service.generateNextStep(testHero, context);
      expect(firstStep).toBeTruthy();
      expect(firstStep!.success).toBe(true);
      expect(context.accumulatedGoo).toBeGreaterThan(0);
      steps.push(firstStep!);
      
      // Second step fails - quest ends
      const secondStep = service.generateNextStep(testHero, context);
      expect(secondStep).toBeTruthy();
      expect(secondStep!.success).toBe(false);
      expect(context.questStatus).toBe('failed');
      steps.push(secondStep!);

      // Generate final quest result - no resources should be awarded
      const finalResult = service.createQuestResult(context, steps);
      
      expect(finalResult).toBeTruthy();
      expect(finalResult.questStatus).toBe('failed');
      expect(finalResult.gooGained || 0).toBe(0);
      expect(finalResult.metalGained || 0).toBe(0);
    });
  });
});
