import { Combatant } from '../../models/combat.model';

export interface CombatActionResult {
  damage?: number;
  healing?: number;
  statusEffects?: string[];
  success: boolean;
  description: string;
}

export interface CombatActionStrategy {
  execute(actor: Combatant, target: Combatant): CombatActionResult;
  canExecute(actor: Combatant, target: Combatant): boolean;
  getActionName(): string;
}
