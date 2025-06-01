import { Injectable } from '@angular/core';
import { CombatActionType } from '../../models/combat.model';
import { CombatAbility } from '../../../quest/models/monster.model';
import { CombatActionStrategy } from './combat-action.interface';
import { AttackActionStrategy } from './attack-action.strategy';
import { DefendActionStrategy } from './defend-action.strategy';
import { FleeActionStrategy } from './flee-action.strategy';
import { PoisonActionStrategy } from './poison-action.strategy';

@Injectable({
  providedIn: 'root'
})
export class ActionFactory {
  constructor(
    private attackAction: AttackActionStrategy,
    private defendAction: DefendActionStrategy,
    private fleeAction: FleeActionStrategy,
    private poisonAction: PoisonActionStrategy
  ) {}

  createAction(actionType: CombatActionType): CombatActionStrategy {
    switch (actionType) {
      case CombatActionType.ATTACK:
        return this.attackAction;
      case CombatActionType.DEFEND:
        return this.defendAction;
      case CombatActionType.FLEE:
        return this.fleeAction;
      case CombatActionType.SPECIAL:
        // For now, fallback to attack. Use createSpecialAction for specific abilities
        return this.attackAction;
      default:
        throw new Error(`Unknown action type: ${actionType}`);
    }
  }

  /**
   * Creates a specific special action based on the ability
   */
  createSpecialAction(ability: CombatAbility): CombatActionStrategy {
    switch (ability) {
      case CombatAbility.POISON:
        return this.poisonAction;
      default:
        throw new Error(`Unknown special ability: ${ability}`);
    }
  }

  /**
   * Gets the action strategy for a specific ability
   */
  getAbilityAction(ability: CombatAbility): CombatActionStrategy {
    switch (ability) {
      case CombatAbility.ATTACK:
        return this.attackAction;
      case CombatAbility.DEFEND:
        return this.defendAction;
      case CombatAbility.POISON:
        return this.poisonAction;
      default:
        throw new Error(`Unknown ability: ${ability}`);
    }
  }

  getAvailableActions(): CombatActionType[] {
    return [
      CombatActionType.ATTACK,
      CombatActionType.DEFEND,
      CombatActionType.FLEE
      // CombatActionType.SPECIAL will be added when special actions are implemented
    ];
  }
}
