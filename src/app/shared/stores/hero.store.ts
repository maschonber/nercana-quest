import { inject } from '@angular/core';
import { signalStore, withState, withMethods } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';
import { Hero } from '../../features/hero/models/hero.model';
import { HeroDomainService } from '../../features/hero/services/hero-domain.service';

interface HeroState {
  hero: Hero;
}

const initialState: HeroState = {
  hero: {
    name: 'Adventurer',
    health: 100,
    maxHealth: 100,
    attack: 12,
    defense: 8,
    luck: 5,
    speed: 15,
    level: 1,
    experience: 0
  }
};

export const HeroStore = signalStore(
  { providedIn: 'root' },
  withState<HeroState>(initialState),
  withMethods((store) => {
    const heroDomainService = inject(HeroDomainService);

    return {
      /**
       * Updates hero experience and handles level ups
       */
      addExperience(experience: number): string {
        const currentHero = store.hero();
        const oldExperience = currentHero.experience;
        const newExperience = oldExperience + experience;

        let updatedHero = { ...currentHero, experience: newExperience };
        let levelUpMessage = '';

        // Check if hero can level up
        if (heroDomainService.canLevelUp(oldExperience, newExperience)) {
          const oldLevel = heroDomainService.calculateLevel(oldExperience);
          const newLevel = heroDomainService.calculateLevel(newExperience);
          const levelsGained = newLevel - oldLevel;

          // Apply stat increases for all levels gained
          const leveledHero = heroDomainService.levelUpHero(
            updatedHero,
            levelsGained
          );
          updatedHero = {
            ...leveledHero,
            level: newLevel
          };

          levelUpMessage =
            levelsGained === 1
              ? ' You gained a level!'
              : ` You gained ${levelsGained} levels!`;
        }

        patchState(store, { hero: updatedHero });
        return levelUpMessage;
      },

      /**
       * Applies damage to hero's health
       */
      takeDamage(damage: number): void {
        const currentHero = store.hero();
        const newHealth = Math.max(0, currentHero.health - damage);
        patchState(store, {
          hero: { ...currentHero, health: newHealth }
        });
      },

      /**
       * Heals hero's health (cannot exceed maxHealth)
       */
      heal(healAmount: number): void {
        const currentHero = store.hero();
        const newHealth = Math.min(
          currentHero.maxHealth,
          currentHero.health + healAmount
        );
        patchState(store, {
          hero: { ...currentHero, health: newHealth }
        });
      },

      /**
       * Fully restores hero's health to maxHealth
       */
      fullHeal(): void {
        const currentHero = store.hero();
        patchState(store, {
          hero: { ...currentHero, health: currentHero.maxHealth }
        });
      },

      /**
       * Sets hero's health directly (used by combat system)
       */
      setHealth(health: number): void {
        const currentHero = store.hero();
        const clampedHealth = Math.max(
          0,
          Math.min(currentHero.maxHealth, health)
        );
        patchState(store, {
          hero: { ...currentHero, health: clampedHealth }
        });
      },

      /**
       * Resets hero to initial state
       */
      resetHero(): void {
        patchState(store, { hero: initialState.hero });
      }
    };
  })
);
