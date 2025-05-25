import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroFacadeService } from '../services/hero-facade.service';

@Component({
  selector: 'app-hero-details',
  templateUrl: './hero-details.component.html',
  styleUrl: './hero-details.component.scss',
  standalone: true,
  imports: [CommonModule]
})
export class HeroDetailsComponent {
  private readonly heroFacade = inject(HeroFacadeService);

  // Use facade's computed signals directly
  hero = this.heroFacade.hero;
  heroPower = this.heroFacade.heroPower;
  experienceToNextLevel = this.heroFacade.experienceToNextLevel;
  experienceProgress = this.heroFacade.experienceProgress;
  
  // Health-related computed signals
  healthPercentage = this.heroFacade.healthPercentage;
  isFullHealth = this.heroFacade.isFullHealth;
  isLowHealth = this.heroFacade.isLowHealth;
}
