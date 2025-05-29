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
  duration: number; // Turns remaining
  stackable: boolean;
  damageReduction?: number; // Percentage (0-1)
  damageIncrease?: number; // Percentage (0-1)
  damageOverTime?: number; // Damage per turn
  healingOverTime?: number; // Healing per turn
}

export interface AppliedStatusEffect extends StatusEffect {
  appliedAt: number; // Turn number when applied
  remainingDuration: number;
}

export class StatusEffectFactory {
  static createDefending(duration: number = 3): StatusEffect {
    return {
      type: StatusEffectType.DEFENDING,
      name: 'Defending',
      description: 'Taking a defensive stance, reducing incoming damage',
      duration,
      stackable: false,
      damageReduction: 0.4 // 40% damage reduction
    };
  }

  static createPoisoned(duration: number = 4, damagePerTurn: number = 5): StatusEffect {
    return {
      type: StatusEffectType.POISONED,
      name: 'Poisoned',
      description: 'Taking poison damage each turn',
      duration,
      stackable: true,
      damageOverTime: damagePerTurn
    };
  }

  static createRegenerating(duration: number = 3, healingPerTurn: number = 8): StatusEffect {
    return {
      type: StatusEffectType.REGENERATING,
      name: 'Regenerating',
      description: 'Recovering health each turn',
      duration,
      stackable: false,
      healingOverTime: healingPerTurn
    };
  }

  static createStunned(duration: number = 1): StatusEffect {
    return {
      type: StatusEffectType.STUNNED,
      name: 'Stunned',
      description: 'Unable to act this turn',
      duration,
      stackable: false
    };
  }

  static createEmpowered(duration: number = 2): StatusEffect {
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
