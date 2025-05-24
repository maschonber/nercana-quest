import { TestBed } from '@angular/core/testing';
import { QuestStore } from './quest.store';
import { QuestDomainService } from '../../features/quest/services/quest-domain.service';
import { HeroDomainService } from '../../features/hero/services/hero-domain.service';

describe('QuestStore', () => {
  let store: QuestStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QuestStore]
    });
    store = TestBed.inject(QuestStore);
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
  });  describe('embarkOnQuest', () => {
    it('should add a log entry when embarking on a quest', () => {
      // Initial log should be empty
      expect(store.log().length).toBe(0);
      
      // Call embarkOnQuest
      store.embarkOnQuest();
      
      // Verify log has one entry
      expect(store.log().length).toBe(1);
      expect(store.log()[0]).toHaveProperty('message');
      expect(store.log()[0]).toHaveProperty('success');
      expect(store.log()[0]).toHaveProperty('timestamp');
      expect(typeof store.log()[0].success).toBe('boolean');
      expect(typeof store.log()[0].message).toBe('string');

      // Call embarkOnQuest again
      store.embarkOnQuest();
      
      // Verify log has two entries (newest first)
      expect(store.log().length).toBe(2);
    });
    
    it('should update hero experience and gold after quest', () => {
      const initialExperience = store.hero().experience;
      const initialGold = store.hero().gold;      // Mock successful quest
      const questDomainService = TestBed.inject(QuestDomainService);
      jest.spyOn(questDomainService, 'calculateQuestOutcome').mockReturnValue({
        success: true,
        message: 'Quest succeeded!',
        timestamp: new Date(),
        experienceGained: 25,
        goldGained: 10
      });
      
      // Call embarkOnQuest
      store.embarkOnQuest();
      
      // Verify experience and gold increased
      expect(store.hero().experience).toBe(initialExperience + 25);
      expect(store.hero().gold).toBe(initialGold + 10);
    });
      it('should level up hero when enough experience is gained', () => {
      // We can't directly modify state, so we'll test with the default initial state
      // The initial hero starts at level 1 with 0 experience
      
      // Mock successful quest with enough XP to level up (over 50 XP needed for level 2)
      const questDomainService = TestBed.inject(QuestDomainService);      const heroDomainService = TestBed.inject(HeroDomainService);
      
      jest.spyOn(questDomainService, 'calculateQuestOutcome').mockReturnValue({
        success: true,
        message: 'Quest succeeded!',
        timestamp: new Date(),
        experienceGained: 60, // This should push to level 2 from starting 0 XP
        goldGained: 10
      });
      
      // Call embarkOnQuest
      store.embarkOnQuest();
      
      // Verify hero leveled up - with new XP formula level 2 is at 50 XP
      expect(store.hero().level).toBe(2);
      expect(store.hero().experience).toBe(60); // 0 + 60
      
      // Verify stats increased
      expect(store.hero().health).toBeGreaterThan(100);
      expect(store.hero().attack).toBeGreaterThan(12);
      expect(store.hero().defense).toBeGreaterThan(8);
    });    it('should handle multiple level ups in one quest', () => {
      // Reset store to test multiple level ups in one quest
      // We'll use a fresh instance of the store
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [QuestStore, QuestDomainService, HeroDomainService]
      });
        // Get new instances of all services
      const newStore = TestBed.inject(QuestStore);
      const newQuestService = TestBed.inject(QuestDomainService);      // Mock successful quest with enough XP for multiple level ups
      jest.spyOn(newQuestService, 'calculateQuestOutcome').mockReturnValue({
        success: true,
        message: 'Quest succeeded!',
        timestamp: new Date(),
        experienceGained: 250, // This should push from level 1 to level 3
        goldGained: 20
      });
      
      // Capture initial stats
      const initialHealth = newStore.hero().health;
      const initialAttack = newStore.hero().attack;
      const initialDefense = newStore.hero().defense;
      const initialLuck = newStore.hero().luck;
      
      // Call embarkOnQuest
      newStore.embarkOnQuest();
      
      // Verify hero leveled up multiple levels
      expect(newStore.hero().level).toBe(3); // Level 3 with new XP formula
      expect(newStore.hero().experience).toBe(250); // 0 + 250
      
      // Verify stats increased for multiple levels (2 level ups)      expect(newStore.hero().health).toBe(initialHealth + 10); // +5 per level for 2 levels
      expect(newStore.hero().attack).toBe(initialAttack + 4);  // +2 per level for 2 levels
      expect(newStore.hero().defense).toBe(initialDefense + 4); // +2 per level for 2 levels
      expect(newStore.hero().luck).toBe(initialLuck + 2);     // +1 per level for 2 levels
    });
  });
});
