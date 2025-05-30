import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogEntry } from '../../../models/log-entry.model';
import {
  CombatOutcome,
  CombatantType,
  CombatantHealthState
} from '../models/combat.model';
import { HeroFacadeService } from '../../hero/services/hero-facade.service';
import { StatusEffectManager } from '../services/status-effect-manager.service';
import { AppliedStatusEffect, StatusEffectType } from '../models/status-effect.model';

@Component({
  selector: 'app-combat-details',
  templateUrl: './combat-details.component.html',
  styleUrl: './combat-details.component.scss',
  standalone: true,
  imports: [CommonModule]
})
export class CombatDetailsComponent {
  @Input() entry!: LogEntry;

  private readonly heroFacade = inject(HeroFacadeService);
  private readonly statusEffectManager = inject(StatusEffectManager);

  // Access hero data for health calculations
  hero = this.heroFacade.hero;

  // Expose enums for template
  CombatantType = CombatantType;

  // Get combat outcome text
  getCombatOutcomeText(outcome: CombatOutcome): string {
    switch (outcome) {
      case CombatOutcome.HERO_VICTORY:
        return 'Victory!';
      case CombatOutcome.HERO_DEFEAT:
        return 'Defeat';
      case CombatOutcome.HERO_FLED:
        return 'Fled';
      default:
        return 'Unknown';
    }
  }

  // Get combat outcome CSS class
  getCombatOutcomeClass(outcome: CombatOutcome): string {
    switch (outcome) {
      case CombatOutcome.HERO_VICTORY:
        return 'outcome-victory';
      case CombatOutcome.HERO_DEFEAT:
        return 'outcome-defeat';
      case CombatOutcome.HERO_FLED:
        return 'outcome-fled';
      default:
        return '';
    }
  }

  // Get health percentage for health bars
  getHealthPercentage(current: number, max: number): number {
    return Math.max(0, Math.min(100, (current / max) * 100));
  }
  // Get actor name for a turn
  getTurnActorName(turn: any): string {
    // Find the actual combatant using actorId from the health states
    if (turn.allCombatantsHealth) {
      const actor = turn.allCombatantsHealth.find(
        (state: CombatantHealthState) => state.id === turn.actorId
      );
      if (actor) {
        return actor.name;
      }
    }

    // Minimal fallback - should rarely be used with current combat system
    return turn.action?.actorName || 'Unknown Actor';
  }

  // Get CSS class for turn based on actor type
  getTurnActorClass(turn: any): string {
    // Find the actual combatant using actorId from the health states
    if (turn.allCombatantsHealth) {
      const actor = turn.allCombatantsHealth.find(
        (state: CombatantHealthState) => state.id === turn.actorId
      );
      if (actor) {
        return actor.type === CombatantType.HERO ? 'hero-turn' : 'monster-turn';
      }
    }

    // Minimal fallback - assume monster turn if actor lookup fails
    return 'monster-turn';
  }
  // Get count of active (alive) enemies for multi-monster encounters
  getActiveEnemiesCount(turn: any): number {
    // Use the comprehensive health tracking if available
    if (turn.allCombatantsHealth) {
      return turn.allCombatantsHealth.filter(
        (state: CombatantHealthState) =>
          state.type === CombatantType.MONSTER && state.isAlive
      ).length;
    }

    // Fallback for legacy data
    if (this.entry.monsters) {
      return this.entry.monsters.length;
    }
    return turn.monsterHealthAfter > 0 ? 1 : 0;
  }

  // Get all enemy health states for a given turn
  getEnemyHealthStates(turn: any): CombatantHealthState[] {
    if (turn.allCombatantsHealth) {
      return turn.allCombatantsHealth.filter(
        (state: CombatantHealthState) => state.type === CombatantType.MONSTER
      );
    }

    // Fallback for legacy single monster data
    if (this.entry.monster) {
      return [
        {
          id: 'legacy-monster',
          name: this.entry.monster.name,
          health: turn.monsterHealthAfter,
          maxHealth: this.entry.monster.maxHealth,
          isAlive: turn.monsterHealthAfter > 0,
          type: CombatantType.MONSTER,
          statusEffects: []
        }
      ];
    }

    return [];
  }
  // Get hero health state for a given turn
  getHeroHealthState(turn: any): CombatantHealthState | null {
    if (turn.allCombatantsHealth) {
      return (
        turn.allCombatantsHealth.find(
          (state: CombatantHealthState) => state.type === CombatantType.HERO
        ) || null
      );
    }

    // Fallback for legacy data
    return {
      id: 'legacy-hero',
      name: this.hero().name,
      health: turn.heroHealthAfter,
      maxHealth: this.hero().maxHealth,
      isAlive: turn.heroHealthAfter > 0,
      type: CombatantType.HERO,
      statusEffects: []
    };
  }

  // Get aggregate health percentage for multiple enemies
  getAggregateEnemyHealthPercentage(turn: any): number {
    if (!this.entry.monsters) {
      return this.getHealthPercentage(turn.monsterHealthAfter, 100);
    }

    // Simplified aggregate health calculation
    // In a real implementation, the turn data would track individual enemy health
    const totalMaxHealth = this.entry.monsters.reduce(
      (sum, monster) => sum + monster.maxHealth,
      0
    );
    const estimatedCurrentHealth = totalMaxHealth * 0.5; // Placeholder logic

    return this.getHealthPercentage(estimatedCurrentHealth, totalMaxHealth);
  }

  // Get status effect icon for display
  getStatusEffectIcon(statusEffect: AppliedStatusEffect): string {
    switch (statusEffect.type) {
      case StatusEffectType.DEFENDING:
        return '🛡️';
      case StatusEffectType.POISONED:
        return '☠️';
      case StatusEffectType.REGENERATING:
        return '💚';
      case StatusEffectType.STUNNED:
        return '😵';
      case StatusEffectType.EMPOWERED:
        return '⚡';
      default:
        return '⭐';
    }
  }

  // Get status effect display with remaining time
  getStatusEffectTooltip(statusEffect: AppliedStatusEffect, currentCombatTime: number): string {
    // Calculate remaining duration at the current combat time
    const remainingDuration = statusEffect.expiresAt - currentCombatTime;
    const durationText = remainingDuration > 0 ? 
      ` (${remainingDuration} clicks remaining)` : 
      ' (expired)';
    return `${statusEffect.name}${durationText}: ${statusEffect.description}`;
  }

  // Get active status effects for a combatant state
  getActiveStatusEffects(combatantState: CombatantHealthState): AppliedStatusEffect[] {
    return combatantState.statusEffects || [];
  }
}
