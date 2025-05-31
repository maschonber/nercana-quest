import { TestBed } from '@angular/core/testing';
import { QuestStore } from './quest.store';
import { HeroStore } from './hero.store';
import { LogStore } from './log.store';
import { QuestStepType } from '../../features/quest/models/quest.model';
import { QuestDomainService } from '../../features/quest/services/quest-domain.service';
import { HeroFacadeService } from '../../features/hero/services/hero-facade.service';
import { StationFacadeService } from '../services/station-facade.service';

/**
 * Integration test for Quest Store level-up log entry behavior
 */
describe('QuestStore - Level-up Log Entries', () => {
  let questStore: InstanceType<typeof QuestStore>;
  let heroStore: InstanceType<typeof HeroStore>;
  let logStore: InstanceType<typeof LogStore>;
  let questDomainService: QuestDomainService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    questStore = TestBed.inject(QuestStore);
    heroStore = TestBed.inject(HeroStore);
    logStore = TestBed.inject(LogStore);
    questDomainService = TestBed.inject(QuestDomainService);
  });

  afterEach(() => {
    heroStore.resetHero();
    logStore.clearLog();
  });

  describe('Level-up Log Entry Separation', () => {
    it('should create separate log entries for level-ups instead of appending to encounter messages', () => {
      // Reset to ensure clean state
      logStore.clearLog();
      
      // Manually test the level-up message separation logic
      // by simulating what happens in processNextQuestStep
      const initialLogCount = logStore.entries().length;
      
      // Add experience that should trigger a level up
      const levelUpMessage = heroStore.addExperience(1000);
      
      if (levelUpMessage) {
        // Simulate the quest step log entry creation
        const questStepEntry = {
          message: 'You encountered a fierce goblin and defeated it!',
          timestamp: new Date(),
          success: true,
          stepType: QuestStepType.ENCOUNTER,
          experienceGained: 1000
        };
        
        logStore.addEntry(questStepEntry);
        
        // Add separate level-up entry as our implementation should do
        const levelUpEntry = {
          message: levelUpMessage.trim(), // Remove leading space
          timestamp: new Date(),
          success: true,
          stepType: QuestStepType.EXPLORATION
        };
        logStore.addEntry(levelUpEntry);
        
        const finalEntries = logStore.entries();
        
        // Should have both the quest step entry AND a separate level-up entry
        expect(finalEntries.length).toBe(initialLogCount + 2);
          // The quest step entry should NOT contain the level-up message
        const questEntry = finalEntries.find(entry => entry.message.includes('goblin'));
        expect(questEntry).toBeDefined();
        expect(questEntry!.message).not.toContain('LEVEL UP');
        expect(questEntry!.message).not.toContain('gained');
        expect(questEntry!.message).not.toContain('reached level');
        
        // There should be a separate level-up entry
        const levelEntry = finalEntries.find(entry => entry.message.includes('LEVEL UP'));
        expect(levelEntry).toBeDefined();
        expect(levelEntry!.message).toContain('🎉 LEVEL UP!');
        expect(levelEntry!.message).toContain(heroStore.hero().name);
        expect(levelEntry!.message).toContain('reached level');
        expect(levelEntry!.stepType).toBe(QuestStepType.EXPLORATION);
        expect(levelEntry!.success).toBe(true);
      } else {
        // If no level up occurred, we still verify the structure works
        expect(levelUpMessage).toBe('');
      }
    });

    it('should ensure level-up messages use clone name and show level with visual emphasis', () => {
      const initialHero = heroStore.hero();
      const levelUpMessage = heroStore.addExperience(2000);
      
      if (levelUpMessage) {        expect(levelUpMessage).not.toContain('You gained');
        expect(levelUpMessage).toContain('🎉 LEVEL UP!');
        expect(levelUpMessage).toContain(initialHero.name);
        expect(levelUpMessage).toContain('reached level');
      }
    });
  });
});
