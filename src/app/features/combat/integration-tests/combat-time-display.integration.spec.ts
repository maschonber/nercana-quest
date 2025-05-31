import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { CombatDetailsComponent } from '../components/combat-details.component';
import { LogEntry } from '../../../models/log-entry.model';
import { QuestStepType } from '../../quest/models/quest.model';
import {
  CombatOutcome,
  CombatantType,
  CombatActionType
} from '../models/combat.model';
import { MonsterType, CombatAbility } from '../../quest/models/monster.model';
import { HeroFacadeService } from '../../hero/services/hero-facade.service';
import { Hero } from '../../hero/models/hero.model';

describe('CombatDetailsComponent - Combat Time Display', () => {
  let component: CombatDetailsComponent;
  let fixture: ComponentFixture<CombatDetailsComponent>;
  
  const mockHero: Hero = {
    name: 'Test Hero',
    health: 100,
    maxHealth: 120,
    attack: 15,
    defense: 10,
    luck: 7,
    speed: 15,
    level: 2,
    experience: 150
  };

  const mockHeroFacade = {
    hero: signal<Hero>(mockHero)
  };

  const mockLogEntry: LogEntry = {
    timestamp: new Date('2024-01-15T10:30:00Z'),
    message: 'You encountered a fierce Void Entity!',
    success: true,
    stepType: QuestStepType.ENCOUNTER,    monster: {
      name: 'Ancient Void Entity',
      type: MonsterType.VOID_ENTITY,
      description: 'A massive void entity that defies conventional understanding.',
      health: 0,
      maxHealth: 120,
      attack: 25,
      defense: 18,
      speed: 25,
      experienceReward: 50,
      abilities: [CombatAbility.ATTACK]
    },
    combatResult: {
      outcome: CombatOutcome.HERO_VICTORY,
      turns: [
        {
          turnNumber: 1,
          combatTime: 50,
          actorId: 'hero-1',
          action: {
            type: CombatActionType.ATTACK,
            description: 'You strike with your sword',
            damage: 15,
            success: true,
            actorName: 'You',
            targetName: 'Ancient Dragon',
            actorId: 'hero-1',
            targetId: 'monster-1'
          },
          actorHealthAfter: 100,
          targetHealthAfter: 105,
          heroHealthAfter: 100,
          monsterHealthAfter: 105,
          allCombatantsHealth: []
        },
        {
          turnNumber: 2,
          combatTime: 120,
          actorId: 'monster-1',
          action: {
            type: CombatActionType.ATTACK,
            description: 'Ancient Dragon breathes fire',
            damage: 20,
            success: true,
            actorName: 'Ancient Dragon',
            targetName: 'You',
            actorId: 'monster-1',
            targetId: 'hero-1'
          },
          actorHealthAfter: 105,
          targetHealthAfter: 80,
          heroHealthAfter: 80,
          monsterHealthAfter: 105,
          allCombatantsHealth: []
        }
      ],
      summary: 'After 2 actions, you emerged victorious!',
      experienceGained: 50
    },
    experienceGained: 50,
    gooGained: 15,
    metalGained: 10
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CombatDetailsComponent],
      providers: [{ provide: HeroFacadeService, useValue: mockHeroFacade }]
    }).compileComponents();

    fixture = TestBed.createComponent(CombatDetailsComponent);
    component = fixture.componentInstance;
    component.entry = mockLogEntry;
    fixture.detectChanges();
  });

  it('should display combat time as "clicks" in turn headers', () => {
    const compiled = fixture.nativeElement;
    const turnHeaders = compiled.querySelectorAll('.turn-number');
    
    expect(turnHeaders.length).toBe(2);
    expect(turnHeaders[0].textContent.trim()).toBe('Click 50');
    expect(turnHeaders[1].textContent.trim()).toBe('Click 120');
  });

  it('should fall back to turn number when combatTime is not available', () => {
    // Modify the entry to not have combatTime for one turn
    const modifiedEntry = { ...mockLogEntry };
    modifiedEntry.combatResult = { ...mockLogEntry.combatResult! };
    modifiedEntry.combatResult.turns = [
      {
        ...mockLogEntry.combatResult!.turns[0],
        combatTime: undefined as any
      }
    ];
    
    component.entry = modifiedEntry;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const turnHeaders = compiled.querySelectorAll('.turn-number');
    
    expect(turnHeaders.length).toBe(1);
    expect(turnHeaders[0].textContent.trim()).toBe('Click 1'); // Should fall back to turnNumber
  });

  it('should display combat summary with actions instead of turns', () => {
    const compiled = fixture.nativeElement;
    const summary = compiled.querySelector('.combat-summary p');
    
    expect(summary.textContent.trim()).toBe('After 2 actions, you emerged victorious!');
  });
});
