import { Component, Output, EventEmitter, inject } from '@angular/core';
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
  @Output() embarkOnQuest = new EventEmitter<void>();

  private readonly heroFacade = inject(HeroFacadeService);

  // Use facade's computed signals directly
  hero = this.heroFacade.hero;
  heroPower = this.heroFacade.heroPower;
  experienceToNextLevel = this.heroFacade.experienceToNextLevel;
  experienceProgress = this.heroFacade.experienceProgress;
  isHeroReady = this.heroFacade.isHeroReady;

  onEmbarkOnQuest(): void {
    if (this.isHeroReady()) {
      this.embarkOnQuest.emit();
    }
  }
}
