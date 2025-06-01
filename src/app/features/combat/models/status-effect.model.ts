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
  duration: number; // Duration in combat time units (clicks)
  stackable: boolean;
  damageReduction?: number; // Percentage (0-1)
  damageIncrease?: number; // Percentage (0-1)
  damageOverTime?: number; // Damage per 100 time units
  healingOverTime?: number; // Healing per 100 time units
}

export interface AppliedStatusEffect extends StatusEffect {
  appliedAt: number; // Combat time when applied (in clicks)
  expiresAt: number; // Combat time when effect expires (in clicks)
}

export class StatusEffectFactory {
  static createDefending(duration: number = 300): StatusEffect {
    return {
      type: StatusEffectType.DEFENDING,
      name: 'Defending',
      description: 'Taking a defensive stance, reducing incoming damage',
      duration,
      stackable: false,
      damageReduction: 0.4 // 40% damage reduction
    };
  }  static createPoisoned(
    duration: number = 300,
    damagePerInterval: number = 5
  ): StatusEffect {
    // 300 clicks as specified in requirements
    return {
      type: StatusEffectType.POISONED,
      name: 'Poisoned',
      description: 'Taking poison damage every 100 time units',
      duration,
      stackable: true,
      damageOverTime: damagePerInterval
    };
  }  static createRegenerating(
    duration: number = 300,
    healingPerInterval: number = 8
  ): StatusEffect {
    return {
      type: StatusEffectType.REGENERATING,
      name: 'Regenerating',
      description: 'Recovering health every 100 time units',
      duration,
      stackable: false,
      healingOverTime: healingPerInterval
    };
  }
  static createStunned(duration: number = 100): StatusEffect {
    return {
      type: StatusEffectType.STUNNED,
      name: 'Stunned',
      description: 'Unable to act during combat actions',
      duration,
      stackable: false
    };
  }
  static createEmpowered(duration: number = 200): StatusEffect {
    return {
      type: StatusEffectType.EMPOWERED,
      name: 'Empowered',
      description: 'Dealing increased damage in combat',
      duration,
      stackable: false,
      damageIncrease: 0.3 // 30% damage increase
    };
  }
}
