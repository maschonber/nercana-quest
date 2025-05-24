import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hero } from '../models/hero.model';
import { HeroDomainService } from '../services/hero-domain.service';

@Component({
  selector: 'app-hero-details',
  templateUrl: './hero-details.component.html',
  styleUrl: './hero-details.component.scss',
  standalone: true,
  imports: [CommonModule]
})
export class HeroDetailsComponent {
  @Input() hero!: Hero;
  @Output() embarkOnQuest = new EventEmitter<void>();

  constructor(private heroDomainService: HeroDomainService) {}
  get heroPower(): number {
    return this.heroDomainService.calculateTotalPower(this.hero);
  }

  get experienceToNextLevel(): number {
    const currentLevel = this.hero.level;
    const currentExp = this.hero.experience;
    return this.heroDomainService.getExperienceForNextLevel(currentExp) - currentExp;
  }

  get isHeroReady(): boolean {
    return this.heroDomainService.validateHeroStats(this.hero);
  }

  onEmbarkOnQuest(): void {
    if (this.isHeroReady) {
      this.embarkOnQuest.emit();
    }
  }
}
