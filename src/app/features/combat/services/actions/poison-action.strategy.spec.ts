import { TestBed } from '@angular/core/testing';
import { PoisonActionStrategy } from './poison-action.strategy';
import { Combatant, CombatActionType, CombatantType } from '../../models/combat.model';
import { CombatAbility } from '../../../quest/models/monster.model';
import { StatusEffectType } from '../../models/status-effect.model';

describe('PoisonActionStrategy', () => {
  let strategy: PoisonActionStrategy;
  let mockSlug: Combatant;
  let mockHero: Combatant;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    strategy = TestBed.inject(PoisonActionStrategy);

    mockSlug = {
      id: 'slug1',
      name: 'Space Slug',
      health: 20,
      maxHealth: 20,
      attack: 6,
      defense: 4,
      speed: 5,
      type: CombatantType.MONSTER,
      isAlive: true,
      hasFled: false,
      statusEffects: [],
      abilities: [CombatAbility.ATTACK, CombatAbility.POISON]
    };

    mockHero = {
      id: 'hero1',
      name: 'Test Hero',
      health: 30,
      maxHealth: 30,
      attack: 10,
      defense: 5,
      speed: 8,
      type: CombatantType.HERO,
      isAlive: true,
      hasFled: false,
      statusEffects: []
    };
  });

  it('should be created', () => {
    expect(strategy).toBeTruthy();
  });

  it('should return SPECIAL as action name', () => {
    expect(strategy.getActionName()).toBe(CombatActionType.SPECIAL);
  });

  it('should only allow execution by monsters with POISON ability', () => {
    expect(strategy.canExecute(mockSlug, mockHero)).toBe(true);
    expect(strategy.canExecute(mockHero, mockSlug)).toBe(false);

    // Test monster without poison ability
    const nonPoisonousMonster = { ...mockSlug, abilities: [CombatAbility.ATTACK] };
    expect(strategy.canExecute(nonPoisonousMonster, mockHero)).toBe(false);
  });

  it('should apply poison effect with base damage when target is not poisoned', () => {
    const result = strategy.execute(mockSlug, mockHero);

    expect(result.success).toBe(true);
    expect(result.statusEffects).toHaveLength(1);
    expect(result.statusEffects![0].type).toBe(StatusEffectType.POISONED);
    expect(result.statusEffects![0].duration).toBe(300);
    expect(result.statusEffects![0].damageOverTime).toBe(5);
    expect(result.description).toContain('releases toxic secretions');
  });
  it('should increase damage when target already has poison stacks', () => {
    // Add existing poison effect to target
    mockHero.statusEffects = [{
      type: StatusEffectType.POISONED,
      name: 'Poisoned',
      description: 'Taking poison damage',
      duration: 300,
      stackable: true,
      damageOverTime: 5,
      appliedAt: 0,
      expiresAt: 300
    }];

    const result = strategy.execute(mockSlug, mockHero);

    expect(result.success).toBe(true);
    expect(result.statusEffects).toHaveLength(1);
    expect(result.statusEffects![0].damageOverTime).toBe(5); // Each stack adds 5
    expect(result.description).toContain('intensifies the poison');
    expect(result.description).toContain('Stack 2');
  });

  it('should handle multiple poison stacks correctly', () => {
    // Add two existing poison effects
    mockHero.statusEffects = [
      {
        type: StatusEffectType.POISONED,
        name: 'Poisoned',
        description: 'Taking poison damage',
        duration: 300,
        stackable: true,
        damageOverTime: 5,
        appliedAt: 0,
        expiresAt: 300
      },
      {
        type: StatusEffectType.POISONED,
        name: 'Poisoned',
        description: 'Taking poison damage',
        duration: 300,
        stackable: true,
        damageOverTime: 7,
        appliedAt: 50,
        expiresAt: 350
      }
    ];    const result = strategy.execute(mockSlug, mockHero);

    expect(result.success).toBe(true);
    expect(result.statusEffects![0].damageOverTime).toBe(5); // Each stack adds 5
    expect(result.description).toContain('Stack 3');
  });
});
