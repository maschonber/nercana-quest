import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroFacadeService } from '../services/hero-facade.service';
import { QuestFacadeService } from '../../quest/services/quest-facade.service';

@Component({
  selector: 'app-hero-actions',
  templateUrl: './hero-actions.component.html',
  styleUrl: './hero-actions.component.scss',
  standalone: true,
  imports: [CommonModule]
})
export class HeroActionsComponent {
  private readonly heroFacade = inject(HeroFacadeService);
  private readonly questFacade = inject(QuestFacadeService);
  // Hero readiness state from hero facade
  isHeroReady = this.heroFacade.isHeroReady;

  // Mission progress state from quest facade
  questInProgress = this.questFacade.questInProgress;

  // Combined state: button is enabled only when clone is ready AND no mission in progress
  canStartQuest = computed(() => this.isHeroReady() && !this.questInProgress());
  // Button text based on current state
  buttonText = computed(() => {
    if (!this.isHeroReady()) {
      return 'Clone expired';
    }
    if (this.questInProgress()) {
      return 'Mission in progress...';
    }
    return 'Deploy on mission';
  });
  onEmbarkOnQuest(): void {
    if (this.canStartQuest()) {
      this.questFacade.embarkOnQuest();
    }
  }

  // Debug heal button that heals clone to full health
  onFullHeal(): void {
    this.heroFacade.fullHeal();
  }
}
