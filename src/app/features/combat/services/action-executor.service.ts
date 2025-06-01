import { Injectable } from '@angular/core';
import {
  Combatant,
  CombatAction,
  CombatActionType,
  CombatTurn,
  Combat
} from '../models/combat.model';
import { CombatAbility } from '../../quest/models/monster.model';
import { ActionFactory } from './actions/action.factory';
import { CombatStateManager } from './combat-state-manager.service';
import { StatusEffectManager } from './status-effect-manager.service';
import { TurnManager } from './turn-manager.service';

@Injectable({
  providedIn: 'root'
})
export class ActionExecutor {
  constructor(
    private actionFactory: ActionFactory,
    private stateManager: CombatStateManager,
    private statusEffectManager: StatusEffectManager,
    private turnManager: TurnManager
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
    let actionStrategy;
    
    // Handle special actions based on actor's abilities
    if (actionType === CombatActionType.SPECIAL) {
      // For special actions, find the first available special ability
      const specialAbility = actor.abilities?.find(ability => 
        ability !== CombatAbility.ATTACK && ability !== CombatAbility.DEFEND
      );
      
      if (specialAbility) {
        actionStrategy = this.actionFactory.getAbilityAction(specialAbility);
      } else {
        // Fallback to attack if no special abilities
        actionStrategy = this.actionFactory.createAction(CombatActionType.ATTACK);
      }
    } else {
      actionStrategy = this.actionFactory.createAction(actionType);
    }
    
    const actionResult = actionStrategy.execute(actor, target);

    // Apply the results of the action
    if (actionResult.damage) {
      this.stateManager.applyDamage(target, actionResult.damage);
    }

    if (actionResult.healing) {
      this.stateManager.applyHealing(actor, actionResult.healing);
    }

    // Apply status effects to the correct target
    if (actionResult.statusEffects) {
      actionResult.statusEffects.forEach(statusEffect => {
        // Status effects from attacks typically apply to the target
        const effectTarget = actionType === CombatActionType.DEFEND ? actor : target;
        this.statusEffectManager.applyStatusEffect(effectTarget, statusEffect);
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
      combatTime: this.turnManager.getCurrentTime(),
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
