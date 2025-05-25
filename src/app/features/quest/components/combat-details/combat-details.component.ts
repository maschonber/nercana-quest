import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogEntry } from '../../../../models/log-entry.model';
import { CombatOutcome, CombatantType } from '../../models/combat.model';
import { HeroFacadeService } from '../../../hero/services/hero-facade.service';

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
      return this.entry.monster?.name || 'Monster';
    }
  }
  
  // Get CSS class for turn based on actor type
  getTurnActorClass(turn: any): string {
    return turn.actor === CombatantType.HERO ? 'hero-turn' : 'monster-turn';
  }
}
