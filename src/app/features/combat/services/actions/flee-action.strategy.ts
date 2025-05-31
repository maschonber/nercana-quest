import { Injectable } from '@angular/core';
import {
  CombatActionStrategy,
  CombatActionResult
} from './combat-action.interface';
import { Combatant, CombatActionType } from '../../models/combat.model';
import { RandomService } from '../../../../shared';

@Injectable({
  providedIn: 'root'
})
export class FleeActionStrategy implements CombatActionStrategy {
  constructor(private randomService: RandomService) {}

  execute(actor: Combatant, target: Combatant): CombatActionResult {
    const fleeChance = this.calculateFleeChance(actor, target);
    const success = this.randomService.rollDice(fleeChance);

    return {
      success,
      description: success
        ? `${actor.name} successfully flees from combat!`
        : `${actor.name} fails to escape!`
    };
  }

  canExecute(actor: Combatant, target: Combatant): boolean {
    return actor.isAlive && !actor.hasFled;
  }
  getActionName(): CombatActionType {
    return CombatActionType.FLEE;
  }

  private calculateFleeChance(actor: Combatant, target: Combatant): number {
    // Base flee chance is 70%
    let fleeChance = 0.7;

    // Speed difference affects flee chance
    const speedDifference = actor.speed - target.speed;
    fleeChance += speedDifference * 0.02; // 2% per speed point difference

    // Low health increases desperation (higher flee chance)
    const healthPercent = actor.health / actor.maxHealth;
    if (healthPercent < 0.3) {
      fleeChance += 0.2; // +20% when below 30% health
    }

    // Clamp between 10% and 95%
    return Math.max(0.1, Math.min(0.95, fleeChance));
  }
}
