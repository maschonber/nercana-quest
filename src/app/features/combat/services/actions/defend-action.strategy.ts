import { Injectable } from '@angular/core';
import {
  CombatActionStrategy,
  CombatActionResult
} from './combat-action.interface';
import { Combatant, CombatActionType } from '../../models/combat.model';

@Injectable({
  providedIn: 'root'
})
export class DefendActionStrategy implements CombatActionStrategy {
  execute(actor: Combatant, target: Combatant): CombatActionResult {
    // Defending provides temporary defense boost (will be handled by combat state manager)
    return {
      success: true,
      description: `${actor.name} takes a defensive stance!`,
      statusEffects: ['defending']
    };
  }

  canExecute(actor: Combatant, target: Combatant): boolean {
    return actor.isAlive && !actor.hasFled;
  }
  getActionName(): CombatActionType {
    return CombatActionType.DEFEND;
  }
}
