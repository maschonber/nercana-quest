import { Injectable } from '@angular/core';
import {
  CombatActionStrategy,
  CombatActionResult
} from './combat-action.interface';
import { Combatant, CombatActionType } from '../../models/combat.model';
import { StatusEffectManager } from '../status-effect-manager.service';

@Injectable({
  providedIn: 'root'
})
export class AttackActionStrategy implements CombatActionStrategy {
  constructor(private statusEffectManager: StatusEffectManager) {}

  execute(actor: Combatant, target: Combatant): CombatActionResult {
    const damage = this.calculateDamage(actor, target);

    return {
      damage,
      success: damage > 0,
      description: `${actor.name} attacks ${target.name} for ${damage} damage!`
    };
  }

  canExecute(actor: Combatant, target: Combatant): boolean {
    return actor.isAlive && target.isAlive && !actor.hasFled && !target.hasFled;
  }
  
  getActionName(): CombatActionType {
    return CombatActionType.ATTACK;
  }

  private calculateDamage(actor: Combatant, target: Combatant): number {
    // Base damage calculation
    let baseDamage = actor.attack - target.defense * 0.5;

    // Ensure minimum damage
    baseDamage = Math.max(1, baseDamage);

    // Apply damage increase from status effects (empowered, etc.)
    const damageIncrease = this.statusEffectManager.calculateDamageIncrease(actor);
    baseDamage *= (1 + damageIncrease);

    // Add randomness (80-120% of base damage)
    const variance = 0.8 + Math.random() * 0.4;

    // Critical hit chance (10% chance for 1.5x damage)
    const criticalMultiplier = Math.random() < 0.1 ? 1.5 : 1.0;

    // Calculate pre-reduction damage
    let finalDamage = Math.floor(baseDamage * variance * criticalMultiplier);

    // Apply damage reduction from target's status effects (defending, etc.)
    const damageReduction = this.statusEffectManager.calculateDamageReduction(target);
    finalDamage = Math.floor(finalDamage * (1 - damageReduction));

    // Ensure minimum damage of 1
    return Math.max(1, finalDamage);
  }
}
