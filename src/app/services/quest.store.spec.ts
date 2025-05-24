import { TestBed } from '@angular/core/testing';
import { QuestStore } from './quest.store';
import { QuestDomainService } from '../features/quest/services/quest-domain.service';

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
  });
  describe('embarkOnQuest', () => {
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
  });
});
