import { Injectable } from '@angular/core';
import { Combatant } from '../models/combat.model';
import { 
  AppliedStatusEffect, 
  StatusEffect, 
  StatusEffectType 
} from '../models/status-effect.model';
import { TurnManager } from './turn-manager.service';

@Injectable({
  providedIn: 'root'
})
export class StatusEffectManager {

  constructor(private turnManager: TurnManager) {}
  
  /**
   * Apply a status effect to a combatant
   */
  applyStatusEffect(combatant: Combatant, statusEffect: StatusEffect): void {
    const currentTime = this.turnManager.getCurrentTime();
    const appliedEffect: AppliedStatusEffect = {
      ...statusEffect,
      appliedAt: currentTime,
      expiresAt: currentTime + statusEffect.duration
    };

    // Check if effect is stackable
    if (!statusEffect.stackable) {
      // Remove existing effect of the same type
      this.removeStatusEffect(combatant, statusEffect.type);
    }

    combatant.statusEffects.push(appliedEffect);
  }

  /**
   * Remove a status effect from a combatant
   */
  removeStatusEffect(combatant: Combatant, effectType: StatusEffectType): void {
    combatant.statusEffects = combatant.statusEffects.filter(
      effect => effect.type !== effectType
    );
  }
  /**
   * Process status effects at the start of a turn (damage/healing over time)
   */
  processStatusEffects(combatant: Combatant): { damage: number; healing: number; expiredEffects: AppliedStatusEffect[] } {
    let totalDamage = 0;
    let totalHealing = 0;
    const expiredEffects: AppliedStatusEffect[] = [];
    const currentTime = this.turnManager.getCurrentTime();

    combatant.statusEffects.forEach(effect => {
      // Apply damage over time
      if (effect.damageOverTime) {
        totalDamage += effect.damageOverTime;
      }

      // Apply healing over time
      if (effect.healingOverTime) {
        totalHealing += effect.healingOverTime;
      }

      // Check if effect has expired
      if (currentTime >= effect.expiresAt) {
        expiredEffects.push(effect);
      }
    });

    // Remove expired effects
    expiredEffects.forEach(expiredEffect => {
      this.removeStatusEffect(combatant, expiredEffect.type);
    });

    return { damage: totalDamage, healing: totalHealing, expiredEffects };
  }

  /**
   * Calculate damage reduction from defending status
   */
  calculateDamageReduction(combatant: Combatant): number {
    let totalReduction = 0;

    combatant.statusEffects.forEach(effect => {
      if (effect.damageReduction) {
        totalReduction += effect.damageReduction;
      }
    });

    // Cap at 80% damage reduction
    return Math.min(0.8, totalReduction);
  }

  /**
   * Calculate damage increase from empowered status
   */
  calculateDamageIncrease(combatant: Combatant): number {
    let totalIncrease = 0;

    combatant.statusEffects.forEach(effect => {
      if (effect.damageIncrease) {
        totalIncrease += effect.damageIncrease;
      }
    });

    return totalIncrease;
  }

  /**
   * Check if combatant has a specific status effect
   */
  hasStatusEffect(combatant: Combatant, effectType: StatusEffectType): boolean {
    return combatant.statusEffects.some(effect => effect.type === effectType);
  }

  /**
   * Get all active status effects for a combatant
   */
  getActiveStatusEffects(combatant: Combatant): AppliedStatusEffect[] {
    return [...combatant.statusEffects];
  }
  /**
   * Generate a description of active status effects for combat log
   */  getStatusEffectDescription(combatant: Combatant): string {
    if (combatant.statusEffects.length === 0) {
      return '';
    }

    const currentTime = this.turnManager.getCurrentTime();
    const effectNames = combatant.statusEffects.map(effect => {
      const timeRemaining = Math.max(0, effect.expiresAt - currentTime);
      const turnsRemaining = Math.ceil(timeRemaining / 70); // Approximate turns remaining (avg ~70 time units per turn)
      const duration = turnsRemaining > 1 ? 
        ` (~${turnsRemaining} turns)` : 
        ' (ending soon)';
      return effect.name + duration;
    });

    return `[${effectNames.join(', ')}]`;
  }

  /**
   * Check if combatant can act (not stunned)
   */
  canAct(combatant: Combatant): boolean {
    return !this.hasStatusEffect(combatant, StatusEffectType.STUNNED);
  }
}
