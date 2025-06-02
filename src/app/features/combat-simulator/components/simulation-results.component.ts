import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulationResults, SimulationRun } from '../models/simulation.model';
import { CombatDetailsComponent } from '../../combat/components/combat-details.component';
import { LogEntry } from '../../../models/log-entry.model';

@Component({
  selector: 'app-simulation-results',
  standalone: true,
  imports: [CommonModule, CombatDetailsComponent],
  templateUrl: './simulation-results.component.html',
  styleUrl: './simulation-results.component.scss'
})
export class SimulationResultsComponent {
  @Input() results!: SimulationResults;
  
  expandedRun: number | null = null;
  showAllRuns = false;

  get displayedRuns(): SimulationRun[] {
    if (this.showAllRuns) {
      return this.results.runs;
    }
    // Show first 10 runs by default
    return this.results.runs.slice(0, 10);
  }

  toggleRunDetails(runNumber: number): void {
    this.expandedRun = this.expandedRun === runNumber ? null : runNumber;
  }

  toggleShowAll(): void {
    this.showAllRuns = !this.showAllRuns;
    // Collapse any expanded run when switching views
    this.expandedRun = null;
  }

  getOutcomeClass(outcome: string): string {
    switch (outcome) {
      case 'hero_victory':
        return 'outcome-victory';
      case 'hero_defeat':
        return 'outcome-defeat';
      case 'hero_fled':
        return 'outcome-fled';
      default:
        return '';
    }
  }

  formatOutcome(outcome: string): string {
    switch (outcome) {
      case 'hero_victory':
        return 'Victory';
      case 'hero_defeat':
        return 'Defeat';
      case 'hero_fled':
        return 'Fled';
      default:
        return outcome;
    }
  }

  createLogEntry(run: SimulationRun): LogEntry {
    return {
      message: `Simulation Run ${run.runNumber}`,
      timestamp: run.timestamp,
      success: run.combatResult.outcome === 'hero_victory',
      experienceGained: run.combatResult.experienceGained,
      combatResult: run.combatResult
    };
  }
}
