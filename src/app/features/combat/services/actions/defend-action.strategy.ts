import { Injectable } from '@angular/core';
import {
  CombatActionStrategy,
  CombatActionResult
} from './combat-action.interface';
import { Combatant, CombatActionType } from '../../models/combat.model';
import { StatusEffectFactory } from '../../models/status-effect.model';

@Injectable({
  providedIn: 'root'
})
export class DefendActionStrategy implements CombatActionStrategy {
  execute(actor: Combatant, target: Combatant): CombatActionResult {
    // Create defending status effect (3 turns, 40% damage reduction)
    const defendingEffect = StatusEffectFactory.createDefending(3);
    
    // Convert to applied status effect
    const appliedEffect = {
      ...defendingEffect,
      appliedAt: 0, // Will be set by the status effect manager
      remainingDuration: defendingEffect.duration
    };

    return {
      success: true,
      description: `${actor.name} takes a defensive stance, reducing incoming damage by ${Math.round(defendingEffect.damageReduction! * 100)}%!`,
      statusEffects: [appliedEffect]
    };
  }

  canExecute(actor: Combatant, target: Combatant): boolean {
    return actor.isAlive && !actor.hasFled;
  }
  
  getActionName(): CombatActionType {
    return CombatActionType.DEFEND;
  }
}
