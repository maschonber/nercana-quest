import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulationResults, SimulationRun } from '../models/simulation.model';
import { CombatDetailsComponent } from '../../combat/components/combat-details.component';
import { LogEntry } from '../../../models/log-entry.model';

@Component({
  selector: 'app-simulation-results',
  standalone: true,
  imports: [CommonModule, CombatDetailsComponent],
  template: `
    <div class="simulation-results">
      <h3>Simulation Results</h3>
      
      <!-- Statistics Summary -->
      <div class="statistics-panel">
        <h4>Summary Statistics</h4>
        <div class="stats-grid">
          <div class="stat-card hero-wins">
            <div class="stat-value">{{ results.statistics.heroWinPercentage | number:'1.1-1' }}%</div>
            <div class="stat-label">Hero Victory Rate</div>
            <div class="stat-count">{{ results.statistics.heroVictories }}/{{ results.statistics.totalRuns }}</div>
          </div>
          
          <div class="stat-card enemy-wins">
            <div class="stat-value">{{ results.statistics.enemyWinPercentage | number:'1.1-1' }}%</div>
            <div class="stat-label">Enemy Victory Rate</div>
            <div class="stat-count">{{ results.statistics.heroDefeats }}/{{ results.statistics.totalRuns }}</div>
          </div>
          
          <div class="stat-card flees">
            <div class="stat-value">{{ results.statistics.fleePercentage | number:'1.1-1' }}%</div>
            <div class="stat-label">Flee Rate</div>
            <div class="stat-count">{{ results.statistics.heroFlees }}/{{ results.statistics.totalRuns }}</div>
          </div>
          
          <div class="stat-card avg-turns">
            <div class="stat-value">{{ results.statistics.averageTurns | number:'1.1-1' }}</div>
            <div class="stat-label">Avg. Turns</div>
          </div>
          
          <div class="stat-card avg-exp">
            <div class="stat-value">{{ results.statistics.averageExperience | number:'1.0-0' }}</div>
            <div class="stat-label">Avg. Experience</div>
          </div>
        </div>
      </div>

      <!-- Combat Log Section -->
      <div class="combat-history">
        <h4>Combat History</h4>
        <div class="history-controls">
          <button 
            class="btn btn--secondary"
            [class.active]="showAllRuns"
            (click)="toggleShowAll()">
            {{ showAllRuns ? 'Show Less' : 'Show All (' + results.runs.length + ')' }}
          </button>
        </div>
        
        <div class="runs-list">
          @for (run of displayedRuns; track run.runNumber) {
            <div class="run-card" [class.expanded]="expandedRun === run.runNumber">
              <div class="run-summary" (click)="toggleRunDetails(run.runNumber)">
                <div class="run-info">
                  <span class="run-number">Run {{ run.runNumber }}</span>
                  <span class="run-outcome" [class]="getOutcomeClass(run.combatResult.outcome)">
                    {{ formatOutcome(run.combatResult.outcome) }}
                  </span>
                  <span class="run-turns">{{ run.combatResult.turns.length }} turns</span>
                  <span class="run-exp">{{ run.combatResult.experienceGained }} XP</span>
                </div>
                <div class="run-toggle">
                  {{ expandedRun === run.runNumber ? '▼' : '▶' }}
                </div>
              </div>
                @if (expandedRun === run.runNumber) {
                <div class="run-details">
                  <app-combat-details [entry]="createLogEntry(run)"></app-combat-details>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
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
