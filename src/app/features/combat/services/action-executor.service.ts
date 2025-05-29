import { Injectable } from '@angular/core';
import {
  Combatant,
  CombatAction,
  CombatActionType,
  CombatTurn,
  Combat
} from '../models/combat.model';
import { ActionFactory } from './actions/action.factory';
import { CombatStateManager } from './combat-state-manager.service';
import { StatusEffectManager } from './status-effect-manager.service';

@Injectable({
  providedIn: 'root'
})
export class ActionExecutor {
  constructor(
    private actionFactory: ActionFactory,
    private stateManager: CombatStateManager,
    private statusEffectManager: StatusEffectManager
  ) {}

  /**
   * Executes a combat turn between an actor and target
   */
  executeTurn(
    turnNumber: number,
    actor: Combatant,
    target: Combatant,
    actionType: CombatActionType,
    combat: Combat
  ): CombatTurn {
    const actionStrategy = this.actionFactory.createAction(actionType);
    const actionResult = actionStrategy.execute(actor, target);

    // Apply the results of the action
    if (actionResult.damage) {
      this.stateManager.applyDamage(target, actionResult.damage);
    }

    if (actionResult.healing) {
      this.stateManager.applyHealing(actor, actionResult.healing);
    }

    // Apply status effects
    if (actionResult.statusEffects) {
      actionResult.statusEffects.forEach(statusEffect => {
        this.statusEffectManager.applyStatusEffect(actor, statusEffect, turnNumber);
      });
    }

    // Handle special action results
    if (actionType === CombatActionType.FLEE && actionResult.success) {
      this.stateManager.setCombatantFled(actor);
    }

    // Create the combat action record
    const action: CombatAction = {
      type: actionType,
      description: actionResult.description,
      damage: actionResult.damage,
      healing: actionResult.healing,
      statusEffects: actionResult.statusEffects,
      actorId: actor.id,
      actorName: actor.name,
      targetId: target.id,
      targetName: target.name,
      success: actionResult.success
    };

    // Capture comprehensive health states after this turn
    const allCombatantsHealth =
      this.stateManager.captureAllCombatantsHealth(combat);

    return {
      turnNumber,
      actorId: actor.id,
      action,
      actorHealthAfter: actor.health,
      targetHealthAfter: target.health,
      allCombatantsHealth,
      // Legacy fields for backward compatibility (can be removed later)
      heroHealthAfter: actor.type === 'hero' ? actor.health : target.health,
      monsterHealthAfter:
        actor.type === 'monster' ? actor.health : target.health
    };
  }
}
