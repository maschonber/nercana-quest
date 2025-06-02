import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TabViewComponent, TabComponent } from '../../../shared/components/tab-view.component';
import { NavigationService } from '../../../shared/services/navigation.service';
import { CombatSimulatorStore } from '../services/combat-simulator.store';
import { CombatSimulatorService } from '../services/combat-simulator.service';
import { TeamSelectorComponent } from './team-selector.component';
import { SimulationResultsComponent } from './simulation-results.component';
import { MonsterComparisonComponent } from './monster-comparison.component';
import { SimulationConfig, SimulationStatus } from '../models/simulation.model';
import { MultiSimulationConfig, MultiSimulationStatus } from '../models/multi-simulation.model';

@Component({
  selector: 'app-combat-simulator',
  standalone: true,  imports: [
    CommonModule,
    RouterModule,
    TabViewComponent,
    TabComponent,
    TeamSelectorComponent,
    SimulationResultsComponent,
    MonsterComparisonComponent
  ],
  templateUrl: './combat-simulator.component.html',
  styleUrl: './combat-simulator.component.scss'
})
export class CombatSimulatorComponent implements OnInit {  protected readonly store = inject(CombatSimulatorStore);
  private readonly navigationService = inject(NavigationService);
  private readonly simulatorService = inject(CombatSimulatorService);
  protected readonly SimulationStatus = SimulationStatus;
  protected readonly MultiSimulationStatus = MultiSimulationStatus;

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

  async startMultiSimulation(): Promise<void> {
    try {
      // Clear any existing errors
      this.store.clearErrors();
      this.store.setIsMultiSimulationRunning(true);
      this.store.setMultiSimulationProgress(0);
      this.store.setMultiSimulationStatus(MultiSimulationStatus.RUNNING);

      // Build multi-simulation configuration
      const config = this.buildMultiSimulationConfig();
      
      // Validate configuration
      const errors = this.simulatorService.validateMultiSimulationConfiguration(config);
      if (errors.length > 0) {
        this.store.setMultiSimulationError(errors.join(', '));
        return;
      }

      // Run multi-simulation with progress updates
      const results = await this.runMultiSimulationWithProgress(config);
      this.store.setMultiSimulationResults(results);
      
    } catch (error) {
      console.error('Multi-simulation failed:', error);
      this.store.setMultiSimulationError('Multi-simulation failed: ' + (error as Error).message);
    }
  }

  private buildMultiSimulationConfig(): MultiSimulationConfig {
    const heroTeam = this.store.enabledHeroes().map(selection => 
      this.simulatorService.createHeroAtLevel(selection.template, selection.level)
    );

    // For multi-simulation, we'll get all available monsters
    const allMonsters = this.simulatorService.getAvailableMonsters();

    return {
      heroTeam,
      runCount: this.store.runCount(),
      monsterSelections: allMonsters
    };
  }

  private async runMultiSimulationWithProgress(config: MultiSimulationConfig): Promise<any> {
    const totalMonsters = config.monsterSelections.length;
    let completed = 0;

    // Create a custom version that tracks progress
    const results = await this.simulatorService.runMultiSimulation(config);
    
    // For now, just set progress to 100% when done
    // In future, could modify service to provide progress callbacks
    this.store.setMultiSimulationProgress(100);
    
    return results;
  }

  resetMultiSimulation(): void {
    this.store.clearMultiSimulationResults();
  }
}
