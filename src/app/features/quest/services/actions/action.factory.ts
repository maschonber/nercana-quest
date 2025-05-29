import { Injectable } from '@angular/core';
import { CombatActionType } from '../../models/combat.model';
import { CombatActionStrategy } from './combat-action.interface';
import { AttackActionStrategy } from './attack-action.strategy';
import { DefendActionStrategy } from './defend-action.strategy';
import { FleeActionStrategy } from './flee-action.strategy';

@Injectable({
  providedIn: 'root'
})
export class ActionFactory {
  
  constructor(
    private attackAction: AttackActionStrategy,
    private defendAction: DefendActionStrategy,
    private fleeAction: FleeActionStrategy
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
        // For now, fallback to attack. Future special actions can be added here
        return this.attackAction;
      default:
        throw new Error(`Unknown action type: ${actionType}`);
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
