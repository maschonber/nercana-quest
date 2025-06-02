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
          
          <!-- Selected Heroes -->
          <div class="selected-members">
            @for (hero of store.selectedHeroes(); track $index) {
              <div class="member-card hero-card">
                <div class="member-info">
                  <span class="member-name">{{ hero.template.name }}</span>
                  <span class="member-level">Level {{ hero.level }}</span>
                </div>
                <div class="member-controls">
                  <select 
                    [value]="hero.level" 
                    (change)="updateHeroLevel($index, $event)"
                    class="level-select">
                    @for (level of availableLevels; track level) {
                      <option [value]="level">{{ level }}</option>
                    }
                  </select>
                  <button 
                    class="btn btn--small btn--danger"
                    (click)="removeHero($index)">
                    Remove
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Add Hero -->
          @if (store.heroTeamSize() < 3) {
            <div class="add-member">
              <select 
                [(ngModel)]="selectedHeroTemplate" 
                class="member-select"
                #heroSelect>
                <option value="">Choose a hero...</option>
                @for (template of availableHeroes; track template.name) {
                  <option [value]="template.name">{{ template.name }}</option>
                }
              </select>
              <select 
                [(ngModel)]="selectedHeroLevel" 
                class="level-select">
                @for (level of availableLevels; track level) {
                  <option [value]="level">Level {{ level }}</option>
                }
              </select>
              <button 
                class="btn btn--small btn--primary"
                [disabled]="!selectedHeroTemplate"
                (click)="addHero()">
                Add Hero
              </button>
            </div>
          }
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

  availableHeroes: TemplateHero[] = [];
  availableMonsters: MonsterSelection[] = [];
  availableLevels: number[] = Array.from({ length: 20 }, (_, i) => i + 1);

  selectedHeroTemplate = '';
  selectedHeroLevel = 1;
  selectedMonsterIndex = '';

  ngOnInit(): void {
    this.loadAvailableOptions();
  }

  private loadAvailableOptions(): void {
    this.availableHeroes = this.simulatorService.getTemplateHeroes();
    this.availableMonsters = this.simulatorService.getAvailableMonsters();
  }

  addHero(): void {
    if (this.selectedHeroTemplate) {
      const template = this.availableHeroes.find(h => h.name === this.selectedHeroTemplate);
      if (template) {
        this.store.addHero(template, this.selectedHeroLevel);
        this.selectedHeroTemplate = '';
        this.selectedHeroLevel = 1;
      }
    }
  }

  removeHero(index: number): void {
    this.store.removeHero(index);
  }

  updateHeroLevel(index: number, event: Event): void {
    const target = event.target as HTMLSelectElement;
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
}
