import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogEntry } from '../../../models/log-entry.model';
import {
  CombatOutcome,
  CombatantType,
  CombatantHealthState
} from '../models/combat.model';
import { HeroFacadeService } from '../../hero/services/hero-facade.service';

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
    if (turn.actor === CombatantType.HERO) {
      return 'You';
    } else {
      // For multi-monster encounters, try to get the specific monster name
      // This would need enhanced turn tracking in the combat system
      if (this.entry.monsters && this.entry.monsters.length > 1) {
        return 'Enemy'; // Simplified for now
      }
      return this.entry.monster?.name || 'Monster';
    }
  }

  // Get CSS class for turn based on actor type
  getTurnActorClass(turn: any): string {
    return turn.actor === CombatantType.HERO ? 'hero-turn' : 'monster-turn';
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
          type: CombatantType.MONSTER
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
      type: CombatantType.HERO
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
}
