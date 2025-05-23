import { TestBed } from '@angular/core/testing';
import { QuestStore } from './quest.store';

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
      luck: 5
    });
  });

  it('should have empty initial log', () => {
    expect(store.log()).toEqual([]);
  });

  describe('embarkOnQuest', () => {
    it('should add a log entry when embarking on a quest', () => {
      // Initial log should be empty
      expect(store.log().length).toBe(0);
      
      // Mock Math.random to return a fixed value
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.9); // Will make the quest fail
      
      // Call embarkOnQuest
      store.embarkOnQuest();
      
      // Verify log has one entry
      expect(store.log().length).toBe(1);
      expect(store.log()[0].message).toContain('Quest failed');
      expect(store.log()[0].success).toBe(false);

      // Test with a successful quest
      Math.random = jest.fn().mockReturnValue(0.1); // Will make the quest succeed
      
      // Call embarkOnQuest again
      store.embarkOnQuest();
      
      // Verify log has two entries
      expect(store.log().length).toBe(2);
      expect(store.log()[0].message).toContain('Quest succeeded');
      expect(store.log()[0].success).toBe(true);
      
      // Restore original Math.random
      Math.random = originalRandom;
    });
  });
});
