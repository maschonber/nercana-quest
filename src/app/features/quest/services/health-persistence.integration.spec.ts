import { TestBed } from '@angular/core/testing';
import { HeroFacadeService } from '../../hero/services/hero-facade.service';
import { HeroDomainService } from '../../hero/services/hero-domain.service';
import { Hero } from '../../hero/models/hero.model';

describe('Health Persistence Integration', () => {
  let heroFacade: HeroFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HeroFacadeService, HeroDomainService]
    });

    heroFacade = TestBed.inject(HeroFacadeService);
  });

  it('should apply damage through the health management system', () => {
    const initialHealth = heroFacade.hero().health;

    // Manually take damage through the facade
    heroFacade.takeDamage(25);

    expect(heroFacade.hero().health).toBe(initialHealth - 25);
    expect(heroFacade.healthPercentage()).toBe(75);
    expect(heroFacade.isLowHealth()).toBe(false);

    // Take more damage to trigger low health
    heroFacade.takeDamage(55);

    expect(heroFacade.hero().health).toBe(20);
    expect(heroFacade.healthPercentage()).toBe(20);
    expect(heroFacade.isLowHealth()).toBe(true); // Should be true when health <= 25% of max
  });

  it('should display correct health indicators', () => {
    expect(heroFacade.isFullHealth()).toBe(true);
    expect(heroFacade.healthPercentage()).toBe(100);
    expect(heroFacade.isLowHealth()).toBe(false);

    // Take some damage
    heroFacade.takeDamage(30);

    expect(heroFacade.isFullHealth()).toBe(false);
    expect(heroFacade.healthPercentage()).toBe(70);
    expect(heroFacade.isLowHealth()).toBe(false);

    // Heal back to full
    heroFacade.heal(30);

    expect(heroFacade.isFullHealth()).toBe(true);
    expect(heroFacade.healthPercentage()).toBe(100);
    expect(heroFacade.isLowHealth()).toBe(false);
  });

  it('should prevent health from going below 0', () => {
    const initialHealth = heroFacade.hero().health;

    // Take massive damage that would normally kill the hero
    heroFacade.takeDamage(initialHealth + 50);

    // Health should not go below 0
    expect(heroFacade.hero().health).toBe(0);
    expect(heroFacade.healthPercentage()).toBe(0);
    expect(heroFacade.isLowHealth()).toBe(true);
    expect(heroFacade.isFullHealth()).toBe(false);
  });

  it('should not heal above maximum health', () => {
    const maxHealth = heroFacade.hero().maxHealth;

    // Take some damage first
    heroFacade.takeDamage(30);
    expect(heroFacade.hero().health).toBe(maxHealth - 30);

    // Heal more than the damage taken
    heroFacade.heal(50);

    // Health should not exceed max health
    expect(heroFacade.hero().health).toBe(maxHealth);
    expect(heroFacade.healthPercentage()).toBe(100);
    expect(heroFacade.isFullHealth()).toBe(true);
  });

  it('should handle setHealth method correctly', () => {
    const maxHealth = heroFacade.hero().maxHealth;

    // Set health to a specific value
    heroFacade.setHealth(50);

    expect(heroFacade.hero().health).toBe(50);
    expect(heroFacade.healthPercentage()).toBe(50);
    expect(heroFacade.isLowHealth()).toBe(false);
    expect(heroFacade.isFullHealth()).toBe(false);

    // Set health to low value to test low health indicator
    heroFacade.setHealth(20);

    expect(heroFacade.hero().health).toBe(20);
    expect(heroFacade.healthPercentage()).toBe(20);
    expect(heroFacade.isLowHealth()).toBe(true); // 20% <= 25% threshold
    expect(heroFacade.isFullHealth()).toBe(false);
  });

  it('should handle fullHeal method correctly', () => {
    // Take some damage
    heroFacade.takeDamage(40);
    expect(heroFacade.hero().health).toBeLessThan(heroFacade.hero().maxHealth);

    // Full heal
    heroFacade.fullHeal();

    expect(heroFacade.hero().health).toBe(heroFacade.hero().maxHealth);
    expect(heroFacade.healthPercentage()).toBe(100);
    expect(heroFacade.isFullHealth()).toBe(true);
    expect(heroFacade.isLowHealth()).toBe(false);
  });
});
