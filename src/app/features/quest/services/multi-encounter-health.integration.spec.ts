import { TestBed } from '@angular/core/testing';
import { QuestStore } from '../../../shared/stores/quest.store';
import { HeroStore } from '../../../shared/stores/hero.store';
import { LogStore } from '../../../shared/stores/log.store';
import { HeroFacadeService } from '../../hero/services/hero-facade.service';
import { QuestDomainService, QuestContext } from './quest-domain.service';
import { MonsterService } from './monster.service';
import { CombatService } from './combat.service';
import { Hero } from '../../hero/models/hero.model';
import { Monster } from '../models/monster.model';
import { QuestStepType, QuestStep } from '../models/quest.model';
import { CombatOutcome, CombatResult } from '../models/combat.model';

describe('Multi-Encounter Health Persistence Integration', () => {
  let questStore: any;
  let heroStore: any;
  let heroFacade: HeroFacadeService;
  let questDomainService: QuestDomainService;
  let combatService: any;    const mockHero: Hero = {
    name: 'Test Hero',
    level: 5,
    experience: 100,
    health: 80,
    maxHealth: 100,
    attack: 15,
    defense: 10,
    luck: 5
  };
  beforeEach(async () => {
    const combatSpy = jest.fn();
    
    await TestBed.configureTestingModule({
      providers: [
        QuestStore,
        HeroStore,
        LogStore,
        HeroFacadeService,
        QuestDomainService,
        MonsterService,
        { provide: CombatService, useValue: { simulateCombat: combatSpy } }
      ]
    }).compileComponents();

    questStore = TestBed.inject(QuestStore);
    heroStore = TestBed.inject(HeroStore);
    heroFacade = TestBed.inject(HeroFacadeService);
    questDomainService = TestBed.inject(QuestDomainService);
    combatService = TestBed.inject(CombatService);    // Initialize hero with mock data
    heroStore.resetHero();
    // Set all hero attributes to match our test scenario
    heroFacade.setHealth(mockHero.health);
    // Note: We can't easily set other hero attributes through the store API,
    // but health and maxHealth should be correct from the initial state
  });

  it('should persist health between multiple encounters in the same quest', (done) => {
    let encounterCount = 0;
    const expectedEncounters = 2;    const healthAfterFirstEncounter = 60; // Hero loses 20 health
    const healthAfterSecondEncounter = 35; // Hero loses 25 more health
    const finalHealthAfterLevelUp = 40; // +5 health from leveling up after second encounter
      // Mock combat service to simulate two encounters with health damage
    combatService.simulateCombat.mockImplementation((hero: Hero, monster: Monster): CombatResult => {
      encounterCount++;      if (encounterCount === 1) {
        // First encounter: hero starts with 80 health, ends with 60
        console.log('First encounter - Hero health before:', hero.health);
        expect(hero.health).toBe(80);
        return {
          outcome: CombatOutcome.HERO_VICTORY,
          turns: [
            {
              turnNumber: 1,
              actor: 'hero' as any,
              action: {
                type: 'attack' as any,
                description: 'Hero attacks',
                damage: 50,
                actorName: 'Hero',
                targetName: 'Monster',
                success: true
              },
              actorHealthAfter: healthAfterFirstEncounter,
              targetHealthAfter: 0,
              heroHealthAfter: healthAfterFirstEncounter,
              monsterHealthAfter: 0
            }          ],
          experienceGained: 25,
          summary: 'Hero victory!'
        };
      } else if (encounterCount === 2) {
        // Second encounter: hero should start with 60 health (after first encounter)
        console.log('Second encounter - Hero health before:', hero.health);
        expect(hero.health).toBe(healthAfterFirstEncounter);
        return {
          outcome: CombatOutcome.HERO_VICTORY,
          turns: [
            {
              turnNumber: 1,
              actor: 'hero' as any,
              action: {
                type: 'attack' as any,
                description: 'Hero attacks',
                damage: 45,
                actorName: 'Hero',
                targetName: 'Monster',
                success: true
              },
              actorHealthAfter: healthAfterSecondEncounter,
              targetHealthAfter: 0,
              heroHealthAfter: healthAfterSecondEncounter,
              monsterHealthAfter: 0
            }          ],
          experienceGained: 30,
          summary: 'Hero victory!'
        };
      }
        // Fallback return for unexpected calls
      return {
        outcome: CombatOutcome.HERO_VICTORY,
        turns: [],        experienceGained: 0,
        summary: 'Default victory'
      };
    });

    // Mock quest context to ensure we get exactly 2 encounters
    jest.spyOn(questDomainService, 'createQuestContext').mockReturnValue({
      remainingStepTypes: [QuestStepType.ENCOUNTER, QuestStepType.ENCOUNTER],
      questStatus: 'ongoing',
      baseExperience: 50,
      encounterCount: 2,
      treasureCount: 0,
      currentStepIndex: 0,
      totalSteps: 2,
      accumulatedGoo: 0,
      accumulatedMetal: 0
    });

    // Mock generateNextStep to control step generation
    jest.spyOn(questDomainService, 'generateNextStep').mockImplementation((hero: Hero, context: QuestContext): QuestStep | null => {
      if (context.remainingStepTypes.length === 0) {
        return null;
      }
      
      const stepType = context.remainingStepTypes.shift()!;
      context.currentStepIndex++;
        if (stepType === QuestStepType.ENCOUNTER) {
        const monster: Monster = { 
          type: 'goblin' as any,
          name: 'Test Monster', 
          health: 30, 
          maxHealth: 30,          attack: 10, 
          defense: 5,
          experienceReward: 25,
          description: 'A test monster'
        };
        const combatResult = combatService.simulateCombat(hero, monster);
        
        return {
          type: QuestStepType.ENCOUNTER,          message: `Encounter ${context.currentStepIndex}`,
          timestamp: new Date(),
          success: combatResult.outcome === CombatOutcome.HERO_VICTORY,
          experienceGained: combatResult.experienceGained,
          monster: monster,
          combatResult: combatResult
        };
      }
      
      return null;
    });
    
    // Start quest and verify health persistence
    questStore.embarkOnQuest();
    
    // Wait for all quest steps to complete
    setTimeout(() => {      // Verify both encounters occurred
      console.log('Final encounter count:', encounterCount);
      expect(encounterCount).toBe(expectedEncounters);
        // Verify final hero health reflects damage from both encounters plus level up healing
      console.log('Final hero health:', heroFacade.hero().health);
      expect(heroFacade.hero().health).toBe(finalHealthAfterLevelUp);
        // Verify quest is no longer in progress
      expect(questStore.questInProgress()).toBeFalsy();
      
      done();
    }, 1500); // Wait for quest processing to complete
  });

  it('should handle hero defeat in multi-encounter quest', (done) => {
    let encounterCount = 0;
      // Mock combat service to simulate hero defeat in second encounter
    combatService.simulateCombat.mockImplementation((hero: Hero, monster: Monster): CombatResult => {
      encounterCount++;
        if (encounterCount === 1) {
        // First encounter: hero wins but takes heavy damage
        return {
          outcome: CombatOutcome.HERO_VICTORY,
          turns: [
            {
              turnNumber: 1,
              actor: 'hero' as any,
              action: {
                type: 'attack' as any,
                description: 'Hero attacks',
                damage: 40,
                actorName: 'Hero',
                targetName: 'Monster',
                success: true
              },
              actorHealthAfter: 10,
              targetHealthAfter: 0,
              heroHealthAfter: 10, // Hero barely survives
              monsterHealthAfter: 0
            }          ],
          experienceGained: 20,
          summary: 'Hero victory!'
        };
      } else if (encounterCount === 2) {
        // Second encounter: hero is defeated
        expect(hero.health).toBe(10); // Should start with health from first encounter
        return {
          outcome: CombatOutcome.HERO_DEFEAT,
          turns: [
            {
              turnNumber: 1,
              actor: 'hero' as any,
              action: {
                type: 'attack' as any,
                description: 'Hero attacks',
                damage: 10,
                actorName: 'Hero',
                targetName: 'Monster',
                success: true
              },
              actorHealthAfter: 0,
              targetHealthAfter: 35,
              heroHealthAfter: 0, // Hero is defeated
              monsterHealthAfter: 35
            }          ],
          experienceGained: 0,
          summary: 'Hero defeated!'
        };
      }
        return {
        outcome: CombatOutcome.HERO_VICTORY,
        turns: [],
        experienceGained: 0,
        summary: 'Default victory'
      };
    });    // Mock quest context for 2 encounters
    jest.spyOn(questDomainService, 'createQuestContext').mockReturnValue({
      remainingStepTypes: [QuestStepType.ENCOUNTER, QuestStepType.ENCOUNTER],
      questStatus: 'ongoing',
      baseExperience: 50,
      encounterCount: 2,
      treasureCount: 0,
      currentStepIndex: 0,
      totalSteps: 2,
      accumulatedGoo: 0,
      accumulatedMetal: 0
    });
    
    // Start quest
    questStore.embarkOnQuest();
    
    // Wait for quest to complete
    setTimeout(() => {
      // Verify both encounters occurred
      expect(encounterCount).toBe(2);
        // Verify hero health reflects the defeat
      expect(heroFacade.hero().health).toBe(0);
      
      // Verify quest completed
      expect(questStore.questInProgress()).toBeFalsy();
      
      done();
    }, 1500);
  });

  it('should handle mixed step types with health persistence', (done) => {
    let encounterCount = 0;
      combatService.simulateCombat.mockImplementation((hero: Hero, monster: Monster): CombatResult => {
      encounterCount++;
      
      if (encounterCount === 1) {
        // Hero takes damage in encounter after exploration
        expect(hero.health).toBe(80); // Should still have initial health
        return {
          outcome: CombatOutcome.HERO_VICTORY,
          turns: [
            {
              turnNumber: 1,
              actor: 'hero' as any,
              action: {
                type: 'attack' as any,
                description: 'Hero attacks',
                damage: 35,
                actorName: 'Hero',
                targetName: 'Monster',
                success: true
              },
              actorHealthAfter: 55,
              targetHealthAfter: 0,
              heroHealthAfter: 55,
              monsterHealthAfter: 0
            }
          ],          experienceGained: 20,
          summary: 'Hero victory!'
        };
      }
      
      return {
        outcome: CombatOutcome.HERO_VICTORY,
        turns: [],        experienceGained: 0,
        summary: 'Default victory'
      };
    });      // Mock quest with exploration -> encounter -> treasure pattern
    jest.spyOn(questDomainService, 'createQuestContext').mockReturnValue({
      remainingStepTypes: [QuestStepType.EXPLORATION, QuestStepType.ENCOUNTER, QuestStepType.TREASURE],      questStatus: 'ongoing',
      baseExperience: 50,
      encounterCount: 1,
      treasureCount: 1,
      currentStepIndex: 0,
      totalSteps: 3,
      accumulatedGoo: 0,
      accumulatedMetal: 0
    });
    
    questStore.embarkOnQuest();
    
    setTimeout(() => {
      // Verify encounter occurred
      expect(encounterCount).toBe(1);
        // Verify health was reduced by encounter
      expect(heroFacade.hero().health).toBe(55);
      
      // Verify quest completed
      expect(questStore.questInProgress()).toBeFalsy();
      
      done();
    }, 2000); // Allow time for all 3 steps
  });
});
