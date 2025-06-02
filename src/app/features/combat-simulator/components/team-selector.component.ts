import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CombatSimulatorStore } from '../services/combat-simulator.store';
import { CombatSimulatorService } from '../services/combat-simulator.service';
import { TemplateHero, MonsterSelection } from '../models/simulation.model';

@Component({
  selector: 'app-team-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],  template: `
    <div class="team-selector">
      <h3>Team Configuration</h3>
      
      <div class="teams-container">
        <!-- Hero Team Section -->
        <div class="team-section hero-section">
          <h4>Hero Team ({{ store.heroTeamSize() }}/3)</h4>
            <!-- Hero Configuration Cards -->
          <div class="hero-configs">
            @for (heroConfig of store.heroConfigs(); track heroConfig.template.name) {
              <div class="hero-config-card" [class.enabled]="heroConfig.enabled">
                <div class="hero-config-layout">
                  <div class="hero-info">
                    <span class="hero-name">{{ heroConfig.template.name }}</span>
                    <span class="hero-stats">{{ getHeroStatsDisplay(heroConfig) }}</span>
                  </div>
                  
                  @if (heroConfig.enabled) {
                    <div class="level-control">
                      <label for="level-{{ $index }}">Level: {{ heroConfig.level }}</label>
                      <input 
                        type="range" 
                        id="level-{{ $index }}"
                        class="level-slider"
                        min="1" 
                        max="20" 
                        [value]="heroConfig.level"
                        (input)="updateHeroLevel($index, $event)"
                        [disabled]="store.isRunning()">
                      <div class="level-marks">
                        <span>1</span>
                        <span>10</span>
                        <span>20</span>
                      </div>
                    </div>
                  }
                  
                  <div class="hero-actions">
                    <button 
                      class="toggle-btn"
                      [class.active]="heroConfig.enabled"
                      [disabled]="!heroConfig.enabled && store.heroTeamSize() >= 3"
                      (click)="toggleHero($index)"
                      [title]="heroConfig.enabled ? 'Disable hero' : 'Enable hero'">
                      {{ heroConfig.enabled ? 'Enabled' : 'Disabled' }}
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Enemy Team Section -->
        <div class="team-section enemy-section">
          <h4>Enemy Team ({{ store.enemyTeamSize() }}/3)</h4>
          
          <!-- Selected Monsters -->
          <div class="selected-members">
            @for (monster of store.selectedMonsters(); track $index) {
              <div class="member-card enemy-card">
                <div class="member-info">
                  <span class="member-name">{{ monster.name }}</span>
                  <span class="member-tier">{{ monster.tier | titlecase }}</span>
                </div>
                <div class="member-controls">
                  <button 
                    class="btn btn--small btn--danger"
                    (click)="removeMonster($index)">
                    Remove
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Add Monster -->
          @if (store.enemyTeamSize() < 3) {
            <div class="add-member">
              <select 
                [(ngModel)]="selectedMonsterIndex" 
                class="member-select">
                <option value="">Choose an enemy...</option>
                @for (monster of availableMonsters; track $index) {
                  <option [value]="$index">{{ monster.name }}</option>
                }
              </select>
              <button 
                class="btn btn--small btn--primary"
                [disabled]="selectedMonsterIndex === ''"
                (click)="addMonster()">
                Add Enemy
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styleUrl: './team-selector.component.scss'
})
export class TeamSelectorComponent implements OnInit {
  protected readonly store = inject(CombatSimulatorStore);
  private readonly simulatorService = inject(CombatSimulatorService);

  availableMonsters: MonsterSelection[] = [];
  selectedMonsterIndex = '';

  ngOnInit(): void {
    this.loadAvailableOptions();
  }

  private loadAvailableOptions(): void {
    this.availableMonsters = this.simulatorService.getAvailableMonsters();
  }

  toggleHero(index: number): void {
    this.store.toggleHero(index);
  }

  updateHeroLevel(index: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    const level = parseInt(target.value, 10);
    this.store.updateHeroLevel(index, level);
  }

  addMonster(): void {
    if (this.selectedMonsterIndex !== '') {
      const index = parseInt(this.selectedMonsterIndex, 10);
      const monster = this.availableMonsters[index];
      if (monster) {
        this.store.addMonster(monster);
        this.selectedMonsterIndex = '';
      }
    }
  }

  removeMonster(index: number): void {
    this.store.removeMonster(index);
  }

  getHeroStatsDisplay(heroConfig: { template: any; level: number; enabled: boolean }): string {
    try {
      const heroAtLevel = this.simulatorService.createHeroAtLevel(heroConfig.template, heroConfig.level);
      return `ATK: ${heroAtLevel.attack} | DEF: ${heroAtLevel.defense} | HP: ${heroAtLevel.maxHealth}`;
    } catch (error) {
      // Fallback to base stats if calculation fails
      return `ATK: ${heroConfig.template.baseStats.attack} | DEF: ${heroConfig.template.baseStats.defense}`;
    }
  }
}
