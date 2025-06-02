import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TabViewComponent, TabComponent } from '../../../shared/components/tab-view.component';
import { NavigationService } from '../../../shared/services/navigation.service';
import { CombatSimulatorStore } from '../services/combat-simulator.store';
import { CombatSimulatorService } from '../services/combat-simulator.service';
import { TeamSelectorComponent } from './team-selector.component';
import { SimulationResultsComponent } from './simulation-results.component';
import { SimulationConfig, SimulationStatus } from '../models/simulation.model';

@Component({
  selector: 'app-combat-simulator',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TabViewComponent,
    TabComponent,
    TeamSelectorComponent,
    SimulationResultsComponent
  ],  template: `
    <app-tab-view>
      <app-tab id="setup" label="Setup">
        <div class="simulator-content">
          <div class="configuration-panel">
            <app-team-selector></app-team-selector>
            @if (store.errors().length > 0) {
              <div class="error-panel">
                <h4>Configuration Errors:</h4>
                <ul>
                  @for (error of store.errors(); track error) {
                    <li>{{ error }}</li>
                  }
                </ul>
              </div>
            }
          </div>
        </div>
        
        <!-- Floating Action Bar -->
        <div class="floating-action-bar">
          <div class="run-count-control">
            <label for="runCount">Runs:</label>
            <select 
              id="runCount" 
              [value]="store.runCount()" 
              (change)="onRunCountChange($event)"
              [disabled]="store.isRunning()"
              class="run-count-select">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          <div class="simulation-actions">
            <button 
              class="btn btn--primary"
              [disabled]="!store.canStartSimulation() || store.isRunning()"
              (click)="startSimulation()">
              @if (store.isRunning()) {
                <span class="loading-spinner"></span>
                Running... {{ store.progress() }}%
              } @else {
                Start Simulation
              }
            </button>
            <button 
              class="btn btn--secondary"
              [disabled]="store.isRunning()"
              (click)="resetConfiguration()">
              Reset
            </button>
          </div>
        </div>
      </app-tab>
      <app-tab id="results" label="Results">
        <div class="results-panel">
          @if (store.currentResults()) {
            <app-simulation-results [results]="store.currentResults()!"></app-simulation-results>
          } @else if (store.status() === SimulationStatus.IDLE) {
            <div class="no-results">
              <h3>No Results Yet</h3>
              <p>Configure your teams and run a simulation to see results.</p>
            </div>
          } @else if (store.isRunning()) {
            <div class="simulation-running">
              <h3>Simulation Running...</h3>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  [style.width.%]="store.progress()">
                </div>
              </div>
              <p>{{ store.progress() }}% complete</p>
            </div>
          }
        </div>
      </app-tab>
    </app-tab-view>
  `,
  styleUrl: './combat-simulator.component.scss'
})
export class CombatSimulatorComponent implements OnInit {
  protected readonly store = inject(CombatSimulatorStore);
  private readonly navigationService = inject(NavigationService);
  private readonly simulatorService = inject(CombatSimulatorService);
  protected readonly SimulationStatus = SimulationStatus;

  ngOnInit(): void {
    this.navigationService.setCurrentTitle('Combat Simulator');
    this.navigationService.setBreadcrumbs([
      { label: 'Station Overview', route: '/' },
      { label: 'Combat Simulator' }
    ]);
  }

  onRunCountChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const count = parseInt(target.value, 10);
    this.store.setRunCount(count);
  }

  async startSimulation(): Promise<void> {
    try {
      // Clear any existing errors
      this.store.clearErrors();
      this.store.setIsRunning(true);
      this.store.setProgress(0);
      this.store.setStatus(SimulationStatus.RUNNING);

      // Build configuration
      const config = this.buildSimulationConfig();
      
      // Validate configuration
      const errors = this.simulatorService.validateConfiguration(config);
      if (errors.length > 0) {
        this.store.setError(errors.join(', '));
        return;
      }

      // Run simulation with progress updates
      const results = await this.runSimulationWithProgress(config);
      this.store.setResults(results);
      
    } catch (error) {
      console.error('Simulation failed:', error);
      this.store.setError('Simulation failed: ' + (error as Error).message);
    }
  }

  private buildSimulationConfig(): SimulationConfig {
    const heroTeam = this.store.selectedHeroes().map(selection => 
      this.simulatorService.createHeroAtLevel(selection.template, selection.level)
    );

    const enemyTeam = this.store.selectedMonsters().map(selection =>
      this.simulatorService.createMonsterFromSelection(selection)
    );

    return {
      heroTeam,
      enemyTeam,
      runCount: this.store.runCount()
    };
  }

  private async runSimulationWithProgress(config: SimulationConfig): Promise<any> {
    // For now, run all at once - in future could add real progress tracking
    this.store.setProgress(50);
    const results = await this.simulatorService.runSimulation(config);
    this.store.setProgress(100);
    return results;
  }

  resetConfiguration(): void {
    this.store.resetConfiguration();
  }
}
