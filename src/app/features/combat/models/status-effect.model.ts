export enum StatusEffectType {
  DEFENDING = 'defending',
  POISONED = 'poisoned',
  REGENERATING = 'regenerating',
  STUNNED = 'stunned',
  EMPOWERED = 'empowered'
}

export interface StatusEffect {
  type: StatusEffectType;
  name: string;
  description: string;
  duration: number; // Duration in combat time units
  stackable: boolean;
  damageReduction?: number; // Percentage (0-1)
  damageIncrease?: number; // Percentage (0-1)
  damageOverTime?: number; // Damage per turn
  healingOverTime?: number; // Healing per turn
}

export interface AppliedStatusEffect extends StatusEffect {
  appliedAt: number; // Combat time when applied
  expiresAt: number; // Combat time when effect expires
}

export class StatusEffectFactory {
  static createDefending(duration: number = 300): StatusEffect { // ~3-4 actions worth of time
    return {
      type: StatusEffectType.DEFENDING,
      name: 'Defending',
      description: 'Taking a defensive stance, reducing incoming damage',
      duration,
      stackable: false,
      damageReduction: 0.4 // 40% damage reduction
    };
  }

  static createPoisoned(duration: number = 400, damagePerTurn: number = 5): StatusEffect { // ~4-5 actions
    return {
      type: StatusEffectType.POISONED,
      name: 'Poisoned',
      description: 'Taking poison damage each turn',
      duration,
      stackable: true,
      damageOverTime: damagePerTurn
    };
  }

  static createRegenerating(duration: number = 300, healingPerTurn: number = 8): StatusEffect { // ~3-4 actions
    return {
      type: StatusEffectType.REGENERATING,
      name: 'Regenerating',
      description: 'Recovering health each turn',
      duration,
      stackable: false,
      healingOverTime: healingPerTurn
    };
  }
  static createStunned(duration: number = 100): StatusEffect { // ~1 action worth of time
    return {
      type: StatusEffectType.STUNNED,
      name: 'Stunned',
      description: 'Unable to act this turn',
      duration,
      stackable: false
    };
  }

  static createEmpowered(duration: number = 200): StatusEffect { // ~2-3 actions
    return {
      type: StatusEffectType.EMPOWERED,
      name: 'Empowered',
      description: 'Dealing increased damage',
      duration,
      stackable: false,
      damageIncrease: 0.3 // 30% damage increase
    };
  }
}
