import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestLogComponent } from './quest-log.component';
import { LogEntry } from '../../../models/log-entry.model';
import { QuestStepType } from '../models/quest.model';
import {
  CombatOutcome,
  CombatantType,
  CombatActionType
} from '../../combat/models/combat.model';
import { MonsterType } from '../models/monster.model';

describe('QuestLogComponent', () => {
  let component: QuestLogComponent;
  let fixture: ComponentFixture<QuestLogComponent>;

  const mockLogEntries: LogEntry[] = [
    {
      message: 'Quest succeeded! Your hero returns victorious.',
      timestamp: new Date('2024-01-01T12:00:00'),
      success: true,
      stepType: QuestStepType.EXPLORATION
    },
    {
      message: 'Quest failed. Your hero barely escapes!',
      timestamp: new Date('2024-01-01T11:30:00'),
      success: false,
      stepType: QuestStepType.EXPLORATION
    },
    {
      message: 'You encountered a fierce Xriit Commander in the station!',
      timestamp: new Date('2024-01-01T11:00:00'),
      success: true,
      stepType: QuestStepType.ENCOUNTER,
      monster: {
        name: 'Xriit Commander',
        type: MonsterType.XRIIT_COMMANDER,
        description: 'A strategic alien commander with advanced weaponry.',
        health: 0,
        maxHealth: 120,
        attack: 25,
        defense: 18,
        speed: 22,
        experienceReward: 50
      },
      combatResult: {
        outcome: CombatOutcome.HERO_VICTORY,
        turns: [
          {
            turnNumber: 1,
            actorId: 'hero-1',
            action: {
              type: CombatActionType.ATTACK,
              description: 'You strike with your sword',
              damage: 15,
              actorName: 'Hero',
              targetName: 'Ancient Dragon',
              success: true,
              actorId: 'hero-1',
              targetId: 'monster-1'
            },
            actorHealthAfter: 100,
            targetHealthAfter: 105,
            heroHealthAfter: 100,
            monsterHealthAfter: 105,
            allCombatantsHealth: [
              {
                id: 'hero-1',
                name: 'Hero',
                health: 100,
                maxHealth: 120,
                isAlive: true,
                type: CombatantType.HERO
              },
              {
                id: 'monster-1',
                name: 'Ancient Dragon',
                health: 105,
                maxHealth: 120,
                isAlive: true,
                type: CombatantType.MONSTER
              }
            ]
          }
        ],
        summary: 'You defeated the dragon!',
        experienceGained: 50
      },
      experienceGained: 50,
      gooGained: 15,
      metalGained: 10
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestLogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(QuestLogComponent);
    component = fixture.componentInstance;
    component.log = mockLogEntries;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display log entries correctly', () => {
    const compiled = fixture.nativeElement;

    expect(compiled.textContent).toContain('Quest succeeded');
    expect(compiled.textContent).toContain('Quest failed');
  });

  it('should apply appropriate classes to log entries based on success', () => {
    const successEntry = fixture.nativeElement.querySelector('li');
    const failEntry = fixture.nativeElement.querySelectorAll('li')[1];

    // Check that the entries exist
    expect(successEntry).toBeTruthy();
    expect(failEntry).toBeTruthy();

    // Check classes are applied correctly
    expect(successEntry.classList.contains('success-entry')).toBe(true);
    expect(failEntry.classList.contains('fail-entry')).toBe(true);

    // Check content is correct
    expect(successEntry.textContent).toContain('Quest succeeded');
    expect(failEntry.textContent).toContain('Quest failed');
  });

  it('should display timestamps correctly', () => {
    const compiled = fixture.nativeElement;
    const timeElements = compiled.querySelectorAll('.entry-time');

    expect(timeElements.length).toBe(mockLogEntries.length);
    // Check that timestamp formatting is present (basic check for bracket format)
    expect(timeElements[0].textContent).toMatch(/\[\d{1,2}:\d{2}\s?(AM|PM)?\]/);
  });

  it('should handle empty log', () => {
    component.log = [];
    fixture.detectChanges();

    const listItems = fixture.nativeElement.querySelectorAll('li');
    expect(listItems.length).toBe(0);

    const emptyMessage = fixture.nativeElement.querySelector('.empty-log');
    expect(emptyMessage).toBeTruthy();
    expect(emptyMessage.textContent).toContain('No quests completed yet');
  });
  it('should show log entry counter when entries exist', () => {
    const counter = fixture.nativeElement.querySelector('.log-counter');
    expect(counter).toBeTruthy();
    expect(counter.textContent).toContain('3 entries');
  });

  it('should mark new entries correctly', () => {
    // Simulate a new entry being added
    const newMockEntries = [
      {
        message: 'New quest completed!',
        timestamp: new Date(),
        success: true,
        stepType: QuestStepType.EXPLORATION
      },
      ...mockLogEntries
    ];

    component.log = newMockEntries;

    // Manually trigger the ngOnChanges lifecycle method
    component.ngOnChanges({
      log: {
        currentValue: newMockEntries,
        previousValue: mockLogEntries,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    fixture.detectChanges();

    // The isNewEntry method should return true for the first entry
    expect(component.isNewEntry(0)).toBeTruthy();
    expect(component.isNewEntry(1)).toBeFalsy();
  });

  it('should apply correct quest step type classes', () => {
    const compiled = fixture.nativeElement;
    const entries = compiled.querySelectorAll('li');

    expect(entries[0].classList.contains('exploration-entry')).toBe(true);
    expect(entries[1].classList.contains('exploration-entry')).toBe(true);
    expect(entries[2].classList.contains('encounter-entry')).toBe(true);
  });

  it('should show expandable details for encounter entries', () => {
    const encounterEntry = fixture.nativeElement.querySelectorAll('li')[2];
    expect(encounterEntry.classList.contains('has-details')).toBe(true);

    const expandIndicator = encounterEntry.querySelector('.expand-indicator');
    expect(expandIndicator).toBeTruthy();
  });

  it('should toggle combat details when encounter entry is clicked', () => {
    const encounterEntry = fixture.nativeElement.querySelectorAll('li')[2];

    // Initially not expanded
    expect(component.isEntryExpanded(2)).toBe(false);

    // Click to expand
    encounterEntry.click();
    expect(component.isEntryExpanded(2)).toBe(true);

    // Click to collapse
    encounterEntry.click();
    expect(component.isEntryExpanded(2)).toBe(false);
  });
  it('should display reward information correctly', () => {
    const compiled = fixture.nativeElement;
    const encounterEntry = compiled.querySelectorAll('li')[2];
    expect(encounterEntry.textContent).toContain('+50 XP');
    expect(encounterEntry.textContent).toContain('+15 Goo');
  });
});
