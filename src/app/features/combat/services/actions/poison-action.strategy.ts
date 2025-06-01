import { Injectable } from '@angular/core';
import { Combatant, CombatActionType } from '../../models/combat.model';
import { CombatAbility } from '../../../quest/models/monster.model';
import { StatusEffectFactory, StatusEffectType } from '../../models/status-effect.model';
import { CombatActionResult, CombatActionStrategy } from './combat-action.interface';

@Injectable({
  providedIn: 'root'
})
export class PoisonActionStrategy implements CombatActionStrategy {
  execute(actor: Combatant, target: Combatant): CombatActionResult {
    // Create base poison status effect - each stack adds 5 damage
    // This creates linear damage progression: 5, 10, 15, 20...
    const poisonDamagePerStack = 5;
    const poisonEffect = StatusEffectFactory.createPoisoned(300, poisonDamagePerStack);    // Check current stacks for display purposes
    // Calculate total current poison damage from all poison effects (for legacy compatibility)
    const existingPoisonEffects = target.statusEffects?.filter(effect => 
      effect.type === StatusEffectType.POISONED
    ) || [];
    
    let currentStacks = 0;
    if (existingPoisonEffects.length > 0) {
      // Sum up all poison damage to get total accumulated damage
      const totalDamage = existingPoisonEffects.reduce((sum, effect) => 
        sum + (effect.damageOverTime || 0), 0
      );
      // Calculate stacks based on accumulated damage or count effects for legacy compatibility
      currentStacks = totalDamage >= poisonDamagePerStack ? 
        Math.max(existingPoisonEffects.length, Math.floor(totalDamage / poisonDamagePerStack)) : 
        existingPoisonEffects.length;
    }

    let description: string;
    if (currentStacks === 0) {
      description = `${actor.name} releases toxic secretions, poisoning ${target.name}!`;
    } else {
      description = `${actor.name} intensifies the poison affecting ${target.name}! (Stack ${currentStacks + 1})`;
    }

    return {
      statusEffects: [poisonEffect],
      success: true,
      description
    };
  }

  canExecute(actor: Combatant, _target: Combatant): boolean {
    // Only monsters with POISON ability can use this action
    return actor.abilities?.includes(CombatAbility.POISON) || false;
  }

  getActionName(): CombatActionType {
    return CombatActionType.SPECIAL;
  }
}
