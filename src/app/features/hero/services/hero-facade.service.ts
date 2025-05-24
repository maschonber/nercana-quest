import { Injectable, inject, computed } from '@angular/core';
import { HeroStore } from '../../../shared/stores/hero.store';
import { HeroDomainService } from './hero-domain.service';

/**
 * Facade service for hero-related operations
 * Provides a clean API for hero management and calculations
 */
@Injectable({
  providedIn: 'root'
})
export class HeroFacadeService {
  private readonly heroStore = inject(HeroStore);
  private readonly heroDomainService = inject(HeroDomainService);

  // Expose hero state
  hero = this.heroStore.hero;

  // Computed values for hero stats
  heroPower = computed(() => this.heroDomainService.calculateTotalPower(this.hero()));
  
  experienceToNextLevel = computed(() => 
    this.heroDomainService.getExperienceForNextLevel(this.hero().experience)
  );
  
  experienceProgress = computed(() => {
    const hero = this.hero();
    const currentLevel = hero.level;
    const expForCurrentLevel = this.heroDomainService.getExperienceForLevel(currentLevel);
    const expForNextLevel = this.heroDomainService.getExperienceForLevel(currentLevel + 1);
    const expInCurrentLevel = hero.experience - expForCurrentLevel;
    const expRequiredForLevel = expForNextLevel - expForCurrentLevel;
    
    return Math.floor((expInCurrentLevel / expRequiredForLevel) * 100);
  });

  isHeroReady = computed(() => this.heroDomainService.validateHeroStats(this.hero()));

  // Hero management methods
  addExperience(experience: number): string {
    return this.heroStore.addExperience(experience);
  }

  addGold(gold: number): void {
    this.heroStore.addGold(gold);
  }

  resetHero(): void {
    this.heroStore.resetHero();
  }
}
