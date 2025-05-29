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
  damageOverTime?: number; // Damage per click
  healingOverTime?: number; // Healing per click
}

export interface AppliedStatusEffect extends StatusEffect {
  appliedAt: number; // Combat time when applied (in clicks)
  expiresAt: number; // Combat time when effect expires (in clicks)
}

export class StatusEffectFactory {  static createDefending(duration: number = 300): StatusEffect { // ~9 actions worth of time (3-4 combat "turns")
    return {
      type: StatusEffectType.DEFENDING,
      name: 'Defending',
      description: 'Taking a defensive stance, reducing incoming damage',
      duration,
      stackable: false,
      damageReduction: 0.4 // 40% damage reduction
    };
  }
  static createPoisoned(duration: number = 400, damagePerTurn: number = 5): StatusEffect { // ~11-13 actions
    return {
      type: StatusEffectType.POISONED,
      name: 'Poisoned',
      description: 'Taking poison damage each combat action',
      duration,
      stackable: true,
      damageOverTime: damagePerTurn
    };
  }
  static createRegenerating(duration: number = 300, healingPerTurn: number = 8): StatusEffect { // ~9 actions
    return {
      type: StatusEffectType.REGENERATING,
      name: 'Regenerating',
      description: 'Recovering health each combat action',
      duration,
      stackable: false,
      healingOverTime: healingPerTurn
    };
  }  static createStunned(duration: number = 100): StatusEffect { // ~3 actions worth of time  
    return {
      type: StatusEffectType.STUNNED,
      name: 'Stunned',
      description: 'Unable to act during combat actions',
      duration,
      stackable: false
    };
  }
  static createEmpowered(duration: number = 200): StatusEffect { // ~6 actions
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
