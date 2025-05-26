import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { CombatDetailsComponent } from './combat-details.component';
import { LogEntry } from '../../../../models/log-entry.model';
import { QuestStepType } from '../../models/quest.model';
import { CombatOutcome, CombatantType, CombatActionType } from '../../models/combat.model';
import { MonsterType } from '../../models/monster.model';
import { HeroFacadeService } from '../../../hero/services/hero-facade.service';
import { Hero } from '../../../hero/models/hero.model';

describe('CombatDetailsComponent', () => {
  let component: CombatDetailsComponent;
  let fixture: ComponentFixture<CombatDetailsComponent>;

  const mockHero: Hero = {
    name: 'Test Hero',
    health: 100,
    maxHealth: 120,
    attack: 15,    defense: 10,
    luck: 7,
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
    stepType: QuestStepType.ENCOUNTER,
    monster: {
      name: 'Ancient Void Entity',
      type: MonsterType.VOID_ENTITY,
      description: 'A massive void entity that defies conventional understanding.',
      health: 0,
      maxHealth: 120,      attack: 25,
      defense: 18,
      experienceReward: 50
    },
    combatResult: {
      outcome: CombatOutcome.HERO_VICTORY,
      turns: [        {
          turnNumber: 1,
          actor: CombatantType.HERO,
          action: {
            type: CombatActionType.ATTACK,
            description: 'You strike with your sword',
            damage: 15,
            success: true,
            actorName: 'You',
            targetName: 'Ancient Dragon'
          },
          actorHealthAfter: 100,
          targetHealthAfter: 105,
          heroHealthAfter: 100,
          monsterHealthAfter: 105
        },        {
          turnNumber: 2,
          actor: CombatantType.MONSTER,
          action: {
            type: CombatActionType.ATTACK,
            description: 'Ancient Dragon breathes fire',
            damage: 20,
            success: true,
            actorName: 'Ancient Dragon',
            targetName: 'You'
          },
          actorHealthAfter: 105,
          targetHealthAfter: 80,
          heroHealthAfter: 80,
          monsterHealthAfter: 105
        }      ],
      summary: 'After a fierce battle, you emerged victorious!',
      experienceGained: 50    },
    experienceGained: 50,
    gooGained: 15,
    metalGained: 10
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CombatDetailsComponent],
      providers: [
        { provide: HeroFacadeService, useValue: mockHeroFacade }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CombatDetailsComponent);
    component = fixture.componentInstance;
    component.entry = mockLogEntry;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display combat outcome correctly', () => {
    expect(component.getCombatOutcomeText(CombatOutcome.HERO_VICTORY)).toBe('Victory!');
    expect(component.getCombatOutcomeText(CombatOutcome.HERO_DEFEAT)).toBe('Defeat');
    expect(component.getCombatOutcomeText(CombatOutcome.HERO_FLED)).toBe('Fled');
  });

  it('should get correct CSS classes for combat outcomes', () => {
    expect(component.getCombatOutcomeClass(CombatOutcome.HERO_VICTORY)).toBe('outcome-victory');
    expect(component.getCombatOutcomeClass(CombatOutcome.HERO_DEFEAT)).toBe('outcome-defeat');
    expect(component.getCombatOutcomeClass(CombatOutcome.HERO_FLED)).toBe('outcome-fled');
  });

  it('should calculate health percentage correctly', () => {
    expect(component.getHealthPercentage(50, 100)).toBe(50);
    expect(component.getHealthPercentage(0, 100)).toBe(0);
    expect(component.getHealthPercentage(120, 100)).toBe(100); // Should cap at 100%
  });

  it('should get correct turn actor names', () => {
    const heroTurn = { actor: CombatantType.HERO };    const monsterTurn = { actor: CombatantType.MONSTER };
    
    expect(component.getTurnActorName(heroTurn)).toBe('You');
    expect(component.getTurnActorName(monsterTurn)).toBe('Ancient Void Entity');
  });

  it('should get correct CSS classes for turn actors', () => {
    const heroTurn = { actor: CombatantType.HERO };
    const monsterTurn = { actor: CombatantType.MONSTER };
    
    expect(component.getTurnActorClass(heroTurn)).toBe('hero-turn');
    expect(component.getTurnActorClass(monsterTurn)).toBe('monster-turn');
  });
  it('should render monster information', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Ancient Void Entity');
    expect(compiled.textContent).toContain('Void Entity');
    expect(compiled.textContent).toContain('A massive void entity that defies');
  });

  it('should render combat turns', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Turn 1');
    expect(compiled.textContent).toContain('Turn 2');
    expect(compiled.textContent).toContain('You strike with your sword');
    expect(compiled.textContent).toContain('Ancient Dragon breathes fire');
  });  it('should render combat rewards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('+50 XP');
    expect(compiled.textContent).toContain('+15 Goo');
    expect(compiled.textContent).toContain('+10 Metal');
  });
  it('should use hero max health for health bar calculation', () => {
    // Hero has maxHealth of 120, current health after turn is 80
    // So health percentage should be 80/120 = 66.67%
    const heroHealthAfter = 80;
    const heroMaxHealth = component.hero().maxHealth; // 120
    const expectedPercentage = (heroHealthAfter / heroMaxHealth) * 100; // 66.66666666666666
    
    expect(component.getHealthPercentage(heroHealthAfter, heroMaxHealth)).toBeCloseTo(expectedPercentage);
    expect(expectedPercentage).toBeCloseTo(66.67); // 80/120 * 100 = 66.67
  });
});
