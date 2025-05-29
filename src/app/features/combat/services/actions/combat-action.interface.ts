import { Combatant, CombatActionType } from "../../models/combat.model";
import { AppliedStatusEffect } from "../../models/status-effect.model";

export interface CombatActionResult {
  damage?: number;
  healing?: number;
  statusEffects?: AppliedStatusEffect[];
  success: boolean;
  description: string;
}

export interface CombatActionStrategy {
  execute(actor: Combatant, target: Combatant): CombatActionResult;
  canExecute(actor: Combatant, target: Combatant): boolean;
  getActionName(): CombatActionType;
}
