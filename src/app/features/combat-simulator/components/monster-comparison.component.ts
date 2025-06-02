import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  MultiSimulationResults, 
  MonsterComparisonResult, 
  SortableColumn 
} from '../models/multi-simulation.model';
import { CombatSimulatorStore } from '../services/combat-simulator.store';

@Component({
  selector: 'app-monster-comparison',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="monster-comparison">
      @if (results) {
        <div class="comparison-header">
          <h3>Monster Comparison Results</h3>
          <p>{{ results.monsterResults.length }} monsters tested with {{ results.config.runCount }} runs each</p>
          <p class="duration">
            Duration: {{ formatDuration() }}
          </p>
        </div>
        
        <div class="comparison-table-container">
          <table class="comparison-table">
            <thead>
              <tr>
                <th 
                  class="sortable" 
                  [class.sorted]="store.sortConfig().column === 'name'"
                  [class.desc]="store.sortConfig().column === 'name' && store.sortConfig().direction === 'desc'"
                  (click)="onSort('name')">
                  Monster Name
                  <span class="sort-indicator">{{ getSortIndicator('name') }}</span>
                </th>
                <th>Type/Tier</th>
                <th 
                  class="sortable numeric" 
                  [class.sorted]="store.sortConfig().column === 'winRate'"
                  [class.desc]="store.sortConfig().column === 'winRate' && store.sortConfig().direction === 'desc'"
                  (click)="onSort('winRate')">
                  Win Rate
                  <span class="sort-indicator">{{ getSortIndicator('winRate') }}</span>
                </th>
                <th 
                  class="sortable numeric" 
                  [class.sorted]="store.sortConfig().column === 'avgHealthLost'"
                  [class.desc]="store.sortConfig().column === 'avgHealthLost' && store.sortConfig().direction === 'desc'"
                  (click)="onSort('avgHealthLost')">
                  Avg Health Lost
                  <span class="sort-indicator">{{ getSortIndicator('avgHealthLost') }}</span>
                </th>
                <th 
                  class="sortable numeric" 
                  [class.sorted]="store.sortConfig().column === 'difficulty'"
                  [class.desc]="store.sortConfig().column === 'difficulty' && store.sortConfig().direction === 'desc'"
                  (click)="onSort('difficulty')">
                  Difficulty
                  <span class="sort-indicator">{{ getSortIndicator('difficulty') }}</span>
                </th>
                <th 
                  class="sortable numeric" 
                  [class.sorted]="store.sortConfig().column === 'avgTurns'"
                  [class.desc]="store.sortConfig().column === 'avgTurns' && store.sortConfig().direction === 'desc'"
                  (click)="onSort('avgTurns')">
                  Avg Turns
                  <span class="sort-indicator">{{ getSortIndicator('avgTurns') }}</span>
                </th>
                <th 
                  class="sortable numeric" 
                  [class.sorted]="store.sortConfig().column === 'avgExperience'"
                  [class.desc]="store.sortConfig().column === 'avgExperience' && store.sortConfig().direction === 'desc'"
                  (click)="onSort('avgExperience')">
                  Avg Experience
                  <span class="sort-indicator">{{ getSortIndicator('avgExperience') }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              @for (result of store.sortedMonsterResults(); track result.monster.type + '-' + result.monster.tier) {
                <tr 
                  class="monster-row"
                  [class.selected]="isSelected(result)"
                  (click)="selectMonster(result)">
                  <td class="monster-name">
                    <strong>{{ result.monster.name }}</strong>
                  </td>
                  <td class="monster-type">
                    <span class="type">{{ result.monster.type }}</span>
                    <span class="tier tier--{{ result.monster.tier.toLowerCase() }}">{{ result.monster.tier }}</span>
                  </td>
                  <td class="numeric">
                    <span class="win-rate" [class]="getWinRateClass(result.statistics.heroWinPercentage)">
                      {{ result.statistics.heroWinPercentage | number:'1.1-1' }}%
                    </span>
                  </td>
                  <td class="numeric">
                    <span class="health-lost">
                      {{ result.averageHealthLost | number:'1.0-0' }}
                    </span>
                  </td>
                  <td class="numeric">
                    <span class="difficulty" [class]="getDifficultyClass(result.difficulty)">
                      {{ result.difficulty | number:'1.0-0' }}
                    </span>
                  </td>
                  <td class="numeric">
                    {{ result.statistics.averageTurns | number:'1.1-1' }}
                  </td>
                  <td class="numeric">
                    {{ result.statistics.averageExperience | number:'1.0-0' }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        
        @if (store.sortedMonsterResults().length === 0) {
          <div class="no-results">
            <p>No monster comparison results available.</p>
          </div>
        }
      } @else {
        <div class="no-results">
          <h3>No Multi-Simulation Results</h3>
          <p>Run a multi-simulation to compare your hero team against all available monsters.</p>
        </div>
      }
    </div>
  `,
  styleUrl: './monster-comparison.component.scss'
})
export class MonsterComparisonComponent {
  @Input() results: MultiSimulationResults | null = null;
  
  protected readonly store = inject(CombatSimulatorStore);

  onSort(column: SortableColumn): void {
    const currentSort = this.store.sortConfig();
    let direction: 'asc' | 'desc' = 'asc';
    
    if (currentSort.column === column) {
      direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    }
    
    this.store.setSortConfig(column, direction);
  }

  getSortIndicator(column: SortableColumn): string {
    const currentSort = this.store.sortConfig();
    if (currentSort.column === column) {
      return currentSort.direction === 'asc' ? '↑' : '↓';
    }
    return '';
  }

  selectMonster(result: MonsterComparisonResult): void {
    this.store.selectMonsterResult(result);
  }

  isSelected(result: MonsterComparisonResult): boolean {
    const selectedResult = this.results?.selectedMonsterResult;
    return selectedResult !== undefined && 
           selectedResult !== null && 
           selectedResult.monster.type === result.monster.type &&
           selectedResult.monster.tier === result.monster.tier;
  }

  getWinRateClass(winRate: number): string {
    if (winRate >= 80) return 'excellent';
    if (winRate >= 60) return 'good';
    if (winRate >= 40) return 'average';
    if (winRate >= 20) return 'poor';
    return 'terrible';
  }

  getDifficultyClass(difficulty: number): string {
    if (difficulty >= 80) return 'very-hard';
    if (difficulty >= 60) return 'hard';
    if (difficulty >= 40) return 'medium';
    if (difficulty >= 20) return 'easy';
    return 'very-easy';
  }

  formatDuration(): string {
    if (!this.results?.startTime || !this.results?.endTime) {
      return 'Unknown';
    }

    const duration = this.results.endTime.getTime() - this.results.startTime.getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  }
}
