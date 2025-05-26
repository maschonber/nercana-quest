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
    const expForCurrentLevel = this.heroDomainService.getExperienceForLevel(currentLevel);    const expForNextLevel = this.heroDomainService.getExperienceForLevel(currentLevel + 1);
    const expInCurrentLevel = hero.experience - expForCurrentLevel;
    const expRequiredForLevel = expForNextLevel - expForCurrentLevel;
    
    return Math.floor((expInCurrentLevel / expRequiredForLevel) * 100);
  });

  isHeroReady = computed(() => this.heroDomainService.validateHeroStats(this.hero()) && this.hero().health > 0);

  // Computed health properties
  healthPercentage = computed(() => {
    const hero = this.hero();
    return Math.floor((hero.health / hero.maxHealth) * 100);
  });

  isFullHealth = computed(() => this.hero().health >= this.hero().maxHealth);
  
  isLowHealth = computed(() => this.hero().health <= this.hero().maxHealth * 0.25);

  // Hero management methods
  addExperience(experience: number): string {
    return this.heroStore.addExperience(experience);
  }

  // Health management methods
  takeDamage(damage: number): void {
    this.heroStore.takeDamage(damage);
  }

  heal(healAmount: number): void {
    this.heroStore.heal(healAmount);
  }

  fullHeal(): void {
    this.heroStore.fullHeal();
  }

  setHealth(health: number): void {
    this.heroStore.setHealth(health);
  }

  resetHero(): void {
    this.heroStore.resetHero();
  }
}
