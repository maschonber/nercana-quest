import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CombatDetailsComponent } from '../components/combat-details.component';
import { LogEntry } from '../../../models/log-entry.model';
import { HeroFacadeService } from '../../hero/services/hero-facade.service';
import { HeroStore } from '../../../shared/stores/hero.store';
import { StatusEffectManager } from '../services/status-effect-manager.service';
import { TurnManager } from '../services/turn-manager.service';
import { CombatActionType, CombatantType, CombatOutcome } from '../models/combat.model';
import { StatusEffectType, StatusEffectFactory } from '../models/status-effect.model';
import { MonsterType, CombatAbility } from '../../quest/models/monster.model';

describe('CombatDetailsComponent - Status Effects Display Integration', () => {
  let component: CombatDetailsComponent;
  let fixture: ComponentFixture<CombatDetailsComponent>;
  let heroStore: InstanceType<typeof HeroStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CombatDetailsComponent],
      providers: [
        HeroFacadeService,
        HeroStore,
        StatusEffectManager,
        TurnManager
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CombatDetailsComponent);
    component = fixture.componentInstance;
    heroStore = TestBed.inject(HeroStore);

    // Initialize hero
    heroStore.resetHero();
  });

  it('should display status effects with icons and tooltips in health display', () => {
    const defendingEffect = {
      ...StatusEffectFactory.createDefending(200),
      appliedAt: 0,
      expiresAt: 200
    };

    const poisonedEffect = {
      ...StatusEffectFactory.createPoisoned(300, 5),
      appliedAt: 0,
      expiresAt: 300
    };    // Create a combat log entry with status effects
    component.entry = {
      message: 'Combat completed',
      timestamp: new Date(),
      success: true,monster: {
        type: MonsterType.SPACE_SLUG,
        name: 'Goblin Warrior',
        health: 50,
        maxHealth: 50,
        attack: 8,
        defense: 4,
        speed: 10,
        experienceReward: 15,
        description: 'A fierce goblin warrior',
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
              type: CombatActionType.DEFEND,
              description: 'You take a defensive stance',
              actorId: 'hero-1',
              actorName: 'Hero',
              targetId: 'hero-1',
              targetName: 'Hero',
              success: true
            },
            actorHealthAfter: 100,
            targetHealthAfter: 100,
            heroHealthAfter: 100,
            monsterHealthAfter: 50,
            allCombatantsHealth: [
              {
                id: 'hero-1',
                name: 'Adventurer',
                health: 100,
                maxHealth: 120,
                isAlive: true,
                type: CombatantType.HERO,
                statusEffects: [defendingEffect]
              },
              {
                id: 'monster-1',
                name: 'Goblin Warrior',
                health: 50,
                maxHealth: 50,
                isAlive: true,
                type: CombatantType.MONSTER,
                statusEffects: [poisonedEffect]
              }
            ]
          }
        ],
        summary: 'Victory achieved!',
        experienceGained: 15
      }
    };

    fixture.detectChanges();

    // Test status effect icon generation
    expect(component.getStatusEffectIcon(defendingEffect)).toBe('🛡️');
    expect(component.getStatusEffectIcon(poisonedEffect)).toBe('☠️');    // Test status effect tooltips (at combat time 50)
    const combatTime = component.entry.combatResult!.turns[0].combatTime; // 50
    const defendingTooltip = component.getStatusEffectTooltip(defendingEffect, combatTime);
    expect(defendingTooltip).toContain('Defending');
    expect(defendingTooltip).toContain('150 clicks remaining'); // 200 - 50 = 150
    expect(defendingTooltip).toContain('Taking a defensive stance');

    const poisonTooltip = component.getStatusEffectTooltip(poisonedEffect, combatTime);
    expect(poisonTooltip).toContain('Poisoned');
    expect(poisonTooltip).toContain('250 clicks remaining'); // 300 - 50 = 250
    expect(poisonTooltip).toContain('Taking poison damage');

    // Test that status effects are retrieved correctly
    const heroState = component.getHeroHealthState(component.entry.combatResult!.turns[0]);
    const heroStatusEffects = component.getActiveStatusEffects(heroState!);
    expect(heroStatusEffects).toHaveLength(1);
    expect(heroStatusEffects[0].type).toBe(StatusEffectType.DEFENDING);

    const enemyStates = component.getEnemyHealthStates(component.entry.combatResult!.turns[0]);
    const enemyStatusEffects = component.getActiveStatusEffects(enemyStates[0]);
    expect(enemyStatusEffects).toHaveLength(1);
    expect(enemyStatusEffects[0].type).toBe(StatusEffectType.POISONED);
  });

  it('should handle multiple status effects on the same combatant', () => {
    const defendingEffect = {
      ...StatusEffectFactory.createDefending(150),
      appliedAt: 0,
      expiresAt: 150
    };

    const empoweredEffect = {
      ...StatusEffectFactory.createEmpowered(180),
      appliedAt: 20,
      expiresAt: 200
    };    component.entry = {
      message: 'Combat with multiple effects',
      timestamp: new Date(),
      success: true,monster: {
        type: MonsterType.XRIIT,
        name: 'Orc Berserker',
        health: 60,
        maxHealth: 60,
        attack: 12,
        defense: 6,
        speed: 8,
        experienceReward: 25,
        description: 'A powerful orc berserker',
        abilities: [CombatAbility.ATTACK, CombatAbility.DEFEND]
      },
      combatResult: {
        outcome: CombatOutcome.HERO_VICTORY,
        turns: [
          {
            turnNumber: 1,
            combatTime: 75,
            actorId: 'hero-1',
            action: {
              type: CombatActionType.ATTACK,
              description: 'You unleash a powerful attack',
              damage: 20,
              actorId: 'hero-1',
              actorName: 'Hero',
              targetId: 'monster-1',
              targetName: 'Orc Berserker',
              success: true
            },
            actorHealthAfter: 95,
            targetHealthAfter: 40,
            heroHealthAfter: 95,
            monsterHealthAfter: 40,
            allCombatantsHealth: [
              {
                id: 'hero-1',
                name: 'Adventurer',
                health: 95,
                maxHealth: 120,
                isAlive: true,
                type: CombatantType.HERO,
                statusEffects: [defendingEffect, empoweredEffect]
              },
              {
                id: 'monster-1',
                name: 'Orc Berserker',
                health: 40,
                maxHealth: 60,
                isAlive: true,
                type: CombatantType.MONSTER,
                statusEffects: []
              }
            ]
          }
        ],
        summary: 'Empowered victory!',
        experienceGained: 25
      }
    };

    fixture.detectChanges();

    // Test multiple status effects
    const heroState = component.getHeroHealthState(component.entry.combatResult!.turns[0]);
    const heroStatusEffects = component.getActiveStatusEffects(heroState!);
    expect(heroStatusEffects).toHaveLength(2);
    expect(heroStatusEffects.map(e => e.type)).toContain(StatusEffectType.DEFENDING);
    expect(heroStatusEffects.map(e => e.type)).toContain(StatusEffectType.EMPOWERED);

    // Test icons for multiple effects
    expect(component.getStatusEffectIcon(heroStatusEffects[0])).toBe('🛡️');
    expect(component.getStatusEffectIcon(heroStatusEffects[1])).toBe('⚡');
  });
  it('should handle combatants with no status effects', () => {    component.entry = {
      message: 'Simple combat with no effects',
      timestamp: new Date(),
      success: true,monster: {
        type: MonsterType.CRITTER,
        name: 'Giant Rat',
        health: 20,
        maxHealth: 20,
        attack: 4,
        defense: 2,
        speed: 15,
        experienceReward: 5,
        description: 'A large, aggressive rat',
        abilities: [CombatAbility.ATTACK]
      },
      combatResult: {
        outcome: CombatOutcome.HERO_VICTORY,
        turns: [
          {
            turnNumber: 1,
            combatTime: 30,
            actorId: 'hero-1',
            action: {
              type: CombatActionType.ATTACK,
              description: 'You strike the rat',
              damage: 25,
              actorId: 'hero-1',
              actorName: 'Hero',
              targetId: 'monster-1',
              targetName: 'Giant Rat',
              success: true
            },
            actorHealthAfter: 120,
            targetHealthAfter: 0,
            heroHealthAfter: 120,
            monsterHealthAfter: 0,
            allCombatantsHealth: [
              {
                id: 'hero-1',
                name: 'Adventurer',
                health: 120,
                maxHealth: 120,
                isAlive: true,
                type: CombatantType.HERO,
                statusEffects: []
              },
              {
                id: 'monster-1',
                name: 'Giant Rat',
                health: 0,
                maxHealth: 20,
                isAlive: false,
                type: CombatantType.MONSTER,
                statusEffects: []
              }
            ]
          }
        ],
        summary: 'Quick victory!',
        experienceGained: 5
      }
    };

    fixture.detectChanges();

    // Test no status effects
    const heroState = component.getHeroHealthState(component.entry.combatResult!.turns[0]);
    const heroStatusEffects = component.getActiveStatusEffects(heroState!);
    expect(heroStatusEffects).toHaveLength(0);

    const enemyStates = component.getEnemyHealthStates(component.entry.combatResult!.turns[0]);
    const enemyStatusEffects = component.getActiveStatusEffects(enemyStates[0]);
    expect(enemyStatusEffects).toHaveLength(0);
  });
});
