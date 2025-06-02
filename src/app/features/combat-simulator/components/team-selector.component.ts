import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CombatSimulatorStore } from '../services/combat-simulator.store';
import { CombatSimulatorService } from '../services/combat-simulator.service';
import { TemplateHero, MonsterSelection } from '../models/simulation.model';

@Component({
  selector: 'app-team-selector',  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team-selector.component.html',
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
