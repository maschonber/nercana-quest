import { Injectable } from '@angular/core';
import { CombatActionStrategy, CombatActionResult } from './combat-action.interface';
import { Combatant } from '../../models/combat.model';

@Injectable({
  providedIn: 'root'
})
export class AttackActionStrategy implements CombatActionStrategy {
  
  execute(actor: Combatant, target: Combatant): CombatActionResult {
    const damage = this.calculateDamage(actor.attack, target.defense);
    
    return {
      damage,
      success: damage > 0,
      description: `${actor.name} attacks ${target.name} for ${damage} damage!`
    };
  }

  canExecute(actor: Combatant, target: Combatant): boolean {
    return actor.isAlive && target.isAlive && !actor.hasFled && !target.hasFled;
  }

  getActionName(): string {
    return 'Attack';
  }

  private calculateDamage(attack: number, defense: number): number {
    // Base damage calculation
    let baseDamage = attack - (defense * 0.5);
    
    // Ensure minimum damage
    baseDamage = Math.max(1, baseDamage);
    
    // Add randomness (80-120% of base damage)
    const variance = 0.8 + (Math.random() * 0.4);
    
    // Critical hit chance (10% chance for 1.5x damage)
    const criticalMultiplier = Math.random() < 0.1 ? 1.5 : 1.0;
    
    // Calculate final damage
    const finalDamage = Math.floor(baseDamage * variance * criticalMultiplier);
    
    return finalDamage;
  }
}
