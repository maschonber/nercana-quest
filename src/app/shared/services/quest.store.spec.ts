import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { QuestStore } from './quest.store';
import { QuestDomainService } from '../../features/quest/services/quest-domain.service';
import { HeroDomainService } from '../../features/hero/services/hero-domain.service';
import { QuestResult, QuestStep, QuestStepType } from '../../features/quest/models/quest.model';

describe('QuestStore', () => {
  let store: QuestStore;
  let questDomainService: QuestDomainService;
  let heroDomainService: HeroDomainService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QuestStore]
    });
    store = TestBed.inject(QuestStore);
    questDomainService = TestBed.inject(QuestDomainService);
    heroDomainService = TestBed.inject(HeroDomainService);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });
  
  it('should have initial hero state', () => {
    expect(store.hero()).toEqual({
      name: 'Adventurer',
      health: 100,
      attack: 12,
      defense: 8,
      luck: 5,
      level: 1,
      experience: 0,
      gold: 0
    });
  });

  it('should have empty initial log', () => {
    expect(store.log()).toEqual([]);
  });
  
  describe('embarkOnQuest', () => {
    it('should add log entries for each quest step with delay', fakeAsync(() => {
      // Mock a quest with multiple steps
      const mockSteps: QuestStep[] = [
        {
          type: QuestStepType.EXPLORATION,
          message: 'Exploration step',
          timestamp: new Date(),
          success: true,
          experienceGained: 0,
          goldGained: 0
        },
        {
          type: QuestStepType.ENCOUNTER,
          message: 'Encounter step',
          timestamp: new Date(),
          success: true,
          experienceGained: 25,
          goldGained: 0
        },
        {
          type: QuestStepType.TREASURE,
          message: 'Treasure step',
          timestamp: new Date(),
          success: true,
          experienceGained: 0,
          goldGained: 10
        }
      ];
      
      const mockQuestResult: QuestResult = {
        success: true,
        message: 'Quest succeeded!',
        timestamp: new Date(),
        experienceGained: 25,
        goldGained: 10,
        steps: mockSteps
      };
      
      jest.spyOn(questDomainService, 'calculateQuestOutcome').mockReturnValue(mockQuestResult);
      
      // Initial log should be empty
      expect(store.log().length).toBe(0);
      
      // Call embarkOnQuest
      store.embarkOnQuest();
      
      // First step should be added immediately
      expect(store.log().length).toBe(1);
      expect(store.log()[0].message).toBe('Exploration step');
      expect(store.log()[0].stepType).toBe(QuestStepType.EXPLORATION);
      
      // Advance time for second step
      tick(200);
      expect(store.log().length).toBe(2);
      expect(store.log()[0].message).toBe('Encounter step');
      expect(store.log()[0].stepType).toBe(QuestStepType.ENCOUNTER);
      
      // Advance time for third step
      tick(200);
      expect(store.log().length).toBe(3);
      expect(store.log()[0].message).toBe('Treasure step');
      expect(store.log()[0].stepType).toBe(QuestStepType.TREASURE);
        // All steps completed
      tick(400); // Add more time to complete all steps
      expect(store.questInProgress()).toBe(false);
    }));
    
    it('should not start a new quest while one is in progress', fakeAsync(() => {
      // Mock a quest with multiple steps
      const mockSteps: QuestStep[] = [
        {
          type: QuestStepType.EXPLORATION,
          message: 'Exploration step',
          timestamp: new Date(),
          success: true,
          experienceGained: 0,
          goldGained: 0
        },
        {
          type: QuestStepType.ENCOUNTER,
          message: 'Encounter step',
          timestamp: new Date(),
          success: true,
          experienceGained: 0,
          goldGained: 0
        }
      ];
      
      const mockQuestResult: QuestResult = {
        success: true,
        message: 'Quest succeeded!',
        timestamp: new Date(),
        experienceGained: 25,
        goldGained: 10,
        steps: mockSteps
      };
      
      const calculateSpy = jest.spyOn(questDomainService, 'calculateQuestOutcome').mockReturnValue(mockQuestResult);
      
      // Call embarkOnQuest
      store.embarkOnQuest();
      
      // First step should be added
      expect(store.log().length).toBe(1);
      
      // Try to embark on another quest immediately
      store.embarkOnQuest();
      
      // calculateQuestOutcome should only be called once since we're already on a quest
      expect(calculateSpy).toHaveBeenCalledTimes(1);
        // Complete the quest
      tick(200); // Second step
      tick(200); // Make sure processing is complete
      
      // Now quest should be complete
      expect(store.questInProgress()).toBe(false);
      
      // Can embark on a new quest
      store.embarkOnQuest();
      expect(calculateSpy).toHaveBeenCalledTimes(2);
    }));
    
    it('should update hero experience and gold progressively through quest steps', fakeAsync(() => {
      const initialExperience = store.hero().experience;
      const initialGold = store.hero().gold;
      
      // Mock a quest with multiple steps and distributed rewards
      const mockSteps: QuestStep[] = [
        {
          type: QuestStepType.EXPLORATION,
          message: 'Exploration step',
          timestamp: new Date(),
          success: true,
          experienceGained: 0,
          goldGained: 0
        },
        {
          type: QuestStepType.ENCOUNTER,
          message: 'Encounter step',
          timestamp: new Date(),
          success: true,
          experienceGained: 15,
          goldGained: 0
        },
        {
          type: QuestStepType.TREASURE,
          message: 'Treasure step',
          timestamp: new Date(),
          success: true,
          experienceGained: 0,
          goldGained: 10
        }
      ];
      
      const mockQuestResult: QuestResult = {
        success: true,
        message: 'Quest succeeded!',
        timestamp: new Date(),
        experienceGained: 15,
        goldGained: 10,
        steps: mockSteps
      };
      
      jest.spyOn(questDomainService, 'calculateQuestOutcome').mockReturnValue(mockQuestResult);
      
      // Call embarkOnQuest
      store.embarkOnQuest();
      
      // After first step, no rewards yet
      expect(store.hero().experience).toBe(initialExperience);
      expect(store.hero().gold).toBe(initialGold);
      
      // After second step, experience should increase
      tick(200);
      expect(store.hero().experience).toBe(initialExperience + 15);
      expect(store.hero().gold).toBe(initialGold);
      
      // After third step, gold should increase
      tick(200);
      expect(store.hero().experience).toBe(initialExperience + 15);
      expect(store.hero().gold).toBe(initialGold + 10);
    }));
    
    it('should level up hero when enough experience is gained from a step', fakeAsync(() => {
      // Mock successful quest with enough XP to level up (over 50 XP needed for level 2)
      const mockSteps: QuestStep[] = [
        {
          type: QuestStepType.EXPLORATION,
          message: 'Exploration step',
          timestamp: new Date(),
          success: true,
          experienceGained: 0,
          goldGained: 0
        },
        {
          type: QuestStepType.ENCOUNTER,
          message: 'Encounter step with level up',
          timestamp: new Date(),
          success: true,
          experienceGained: 60, // This should push to level 2 from starting 0 XP
          goldGained: 0
        }
      ];
      
      const mockQuestResult: QuestResult = {
        success: true,
        message: 'Quest succeeded!',
        timestamp: new Date(),
        experienceGained: 60,
        goldGained: 0,
        steps: mockSteps
      };
      
      jest.spyOn(questDomainService, 'calculateQuestOutcome').mockReturnValue(mockQuestResult);
      jest.spyOn(heroDomainService, 'canLevelUp').mockImplementation((oldXp, newXp) => {
        // Level 2 requires 50 XP
        return oldXp < 50 && newXp >= 50;
      });
      
      // Call embarkOnQuest
      store.embarkOnQuest();
      
      // First step should not level up
      expect(store.hero().level).toBe(1);
      
      // Second step should trigger level up
      tick(200);
      expect(store.hero().level).toBe(2);
      expect(store.log()[0].message).toContain('level');
      
      // Verify stats increased
      expect(store.hero().health).toBeGreaterThan(100);
      expect(store.hero().attack).toBeGreaterThan(12);
      expect(store.hero().defense).toBeGreaterThan(8);
    }));
      it('should handle multiple level ups in one quest', fakeAsync(() => {
      // Reset store to test multiple level ups in one quest
      // We'll use a fresh instance of the store
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [QuestStore, QuestDomainService, HeroDomainService]
      });
        // Get new instances of all services
      const newStore = TestBed.inject(QuestStore);
      const newQuestService = TestBed.inject(QuestDomainService);
      const newHeroDomainService = TestBed.inject(HeroDomainService);
      
      // Create mock steps with experience for level ups
      const mockSteps = [
        {
          type: QuestStepType.EXPLORATION,
          message: 'Exploration step',
          timestamp: new Date(),
          success: true,
          experienceGained: 0,
          goldGained: 0
        },
        {
          type: QuestStepType.ENCOUNTER,
          message: 'Encounter step with massive XP',
          timestamp: new Date(),
          success: true,
          experienceGained: 250, // This should push to level 3 from starting 0 XP
          goldGained: 0
        }
      ];
      
      // Mock successful quest with enough XP for multiple level ups
      jest.spyOn(newQuestService, 'calculateQuestOutcome').mockReturnValue({
        success: true,
        message: 'Quest succeeded!',
        timestamp: new Date(),
        experienceGained: 250, // This should push from level 1 to level 3
        goldGained: 20,
        steps: mockSteps
      });
      
      // Mock canLevelUp method to allow multiple level ups
      jest.spyOn(newHeroDomainService, 'canLevelUp').mockImplementation((oldXp, newXp) => {
        return oldXp < 200 && newXp >= 200; // Level 3 requires 200 XP
      });
      
      // Mock calculateLevel to return level 3 for 250 XP
      jest.spyOn(newHeroDomainService, 'calculateLevel').mockImplementation((xp) => {
        if (xp < 50) return 1;
        if (xp < 200) return 2;
        return 3;
      });
      
      // Capture initial stats
      const initialHealth = newStore.hero().health;
      const initialAttack = newStore.hero().attack;
      const initialDefense = newStore.hero().defense;
      const initialLuck = newStore.hero().luck;
      
      // Call embarkOnQuest
      newStore.embarkOnQuest();
      
      // First step has no XP gain
      expect(newStore.hero().level).toBe(1);
      
      // Second step gives the big XP boost and levels up
      tick(200);
      
      // Verify hero leveled up multiple levels
      expect(newStore.hero().level).toBe(3); // Level 3 with new XP formula
      expect(newStore.hero().experience).toBe(250); // 0 + 250
      
      // Verify stats increased for multiple levels (2 level ups)
      expect(newStore.hero().health).toBe(initialHealth + 10); // +5 per level for 2 levels
      expect(newStore.hero().attack).toBe(initialAttack + 4);  // +2 per level for 2 levels
      expect(newStore.hero().defense).toBe(initialDefense + 4); // +2 per level for 2 levels
      expect(newStore.hero().luck).toBe(initialLuck + 2);     // +1 per level for 2 levels
    }));
  });
});
