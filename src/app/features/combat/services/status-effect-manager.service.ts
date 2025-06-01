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
   */  applyStatusEffect(combatant: Combatant, statusEffect: StatusEffect): void {
    const currentTime = this.turnManager.getCurrentTime();
    
    // Check if effect already exists
    const existingEffect = combatant.statusEffects.find(
      effect => effect.type === statusEffect.type
    );

    if (existingEffect && statusEffect.stackable) {
      // Stack the effect: keep existing timer but increase magnitude and extend duration if needed
      // DON'T reset appliedAt - this preserves the original timing for global intervals
      const newExpirationTime = currentTime + statusEffect.duration;
      existingEffect.expiresAt = Math.max(existingEffect.expiresAt, newExpirationTime);
      
      // Increase magnitude for stacking
      if (statusEffect.damageOverTime && existingEffect.damageOverTime) {
        existingEffect.damageOverTime += statusEffect.damageOverTime;
      }
      if (statusEffect.healingOverTime && existingEffect.healingOverTime) {
        existingEffect.healingOverTime += statusEffect.healingOverTime;
      }
      if (statusEffect.damageReduction && existingEffect.damageReduction) {
        existingEffect.damageReduction = Math.min(0.9, existingEffect.damageReduction + statusEffect.damageReduction);
      }
      if (statusEffect.damageIncrease && existingEffect.damageIncrease) {
        existingEffect.damageIncrease += statusEffect.damageIncrease;
      }
    } else {
      // Remove existing effect if not stackable, or add new effect
      if (!statusEffect.stackable) {
        this.removeStatusEffect(combatant, statusEffect.type);
      }
      
      const appliedEffect: AppliedStatusEffect = {
        ...statusEffect,
        appliedAt: currentTime,
        expiresAt: currentTime + statusEffect.duration
      };
      
      combatant.statusEffects.push(appliedEffect);
    }
  }

  /**
   * Remove a status effect from a combatant
   */
  removeStatusEffect(combatant: Combatant, effectType: StatusEffectType): void {
    combatant.statusEffects = combatant.statusEffects.filter(
      effect => effect.type !== effectType
    );
  }  /**
   * Process status effects at the start of each action (expiration only, no damage/healing)
   * Damage/healing over time should only be applied during dedicated status effect turns
   */
  processStatusEffects(combatant: Combatant): { damage: number; healing: number; expiredEffects: AppliedStatusEffect[] } {
    let totalDamage = 0;  // Always 0 - damage only applied during status effect turns
    let totalHealing = 0; // Always 0 - healing only applied during status effect turns
    const expiredEffects: AppliedStatusEffect[] = [];
    const currentTime = this.turnManager.getCurrentTime();

    combatant.statusEffects.forEach(effect => {
      // DO NOT apply damage/healing here - that's handled by processTimeBasedStatusEffects()
      // This method only handles expiration checking during regular combat actions
      
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
  }/**
   * Process time-based status effects for damage/healing over time
   * Called at fixed global intervals (100, 200, 300, etc.)
   */
  processTimeBasedStatusEffects(combatant: Combatant): { 
    damage: number; 
    healing: number; 
    expiredEffects: AppliedStatusEffect[];
  } {
    let totalDamage = 0;
    let totalHealing = 0;
    const expiredEffects: AppliedStatusEffect[] = [];
    const currentTime = this.turnManager.getCurrentTime();

    combatant.statusEffects.forEach(effect => {
      // Check if effect has expired BEFORE applying any damage/healing
      if (currentTime >= effect.expiresAt) {
        expiredEffects.push(effect);
        return; // Skip processing for expired effects
      }

      // Only apply damage/healing if the effect was active when applied (before current time)
      if (effect.appliedAt < currentTime) {
        if (effect.damageOverTime) {
          totalDamage += effect.damageOverTime;
        }
        if (effect.healingOverTime) {
          totalHealing += effect.healingOverTime;
        }
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
  }  /**
   * Check if combatant can act (not stunned)
   */
  canAct(combatant: Combatant): boolean {
    return !this.hasStatusEffect(combatant, StatusEffectType.STUNNED);
  }

  /**
   * Get the stack count for a stackable status effect (useful for display)
   */
  getStackCount(combatant: Combatant, effectType: StatusEffectType): number {
    const effect = combatant.statusEffects.find(e => e.type === effectType);
    if (!effect || effectType !== StatusEffectType.POISONED) {
      return 0;
    }
    
    // For poison, calculate stacks based on damage over time
    // Base poison damage is 5, so stacks = current damage / 5
    return Math.floor((effect.damageOverTime || 0) / 5);
  }
}
