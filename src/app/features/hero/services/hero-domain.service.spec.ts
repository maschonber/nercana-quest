import { TestBed } from '@angular/core/testing';
import { HeroDomainService } from './hero-domain.service';
import { Hero } from '../models/hero.model';

describe('HeroDomainService', () => {
  let service: HeroDomainService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeroDomainService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  describe('calculateTotalPower', () => {
    it('should calculate total power correctly', () => {
      const hero: Hero = {
        name: 'Test Hero',
        health: 100,
        maxHealth: 100,
        attack: 12,
        defense: 8,
        luck: 5,
        speed: 15,
        level: 1,
        experience: 0
      };

      expect(service.calculateTotalPower(hero)).toBe(125);
    });
  });
  describe('calculateLevel', () => {
    it('should calculate level based on experience with scaling formula', () => {
      expect(service.calculateLevel(0)).toBe(1);
      expect(service.calculateLevel(40)).toBe(1);
      expect(service.calculateLevel(50)).toBe(2);
      expect(service.calculateLevel(200)).toBe(3);
      expect(service.calculateLevel(450)).toBe(4);
      expect(service.calculateLevel(800)).toBe(5);
    });
  });

  describe('getExperienceForLevel', () => {
    it('should calculate total experience needed for a specific level', () => {
      expect(service.getExperienceForLevel(1)).toBe(0);
      expect(service.getExperienceForLevel(2)).toBe(50);
      expect(service.getExperienceForLevel(3)).toBe(200);
      expect(service.getExperienceForLevel(4)).toBe(450);
      expect(service.getExperienceForLevel(5)).toBe(800);
    });
  });

  describe('getExperienceForNextLevel', () => {
    it('should calculate experience needed to reach next level', () => {
      expect(service.getExperienceForNextLevel(0)).toBe(50);
      expect(service.getExperienceForNextLevel(50)).toBe(150);
      expect(service.getExperienceForNextLevel(150)).toBe(50);
      expect(service.getExperienceForNextLevel(300)).toBe(150);
    });
  });

  describe('canLevelUp', () => {
    it('should determine if hero can level up based on old and new experience', () => {
      expect(service.canLevelUp(40, 45)).toBe(false); // Both level 1
      expect(service.canLevelUp(40, 60)).toBe(true); // Level 1 to 2
      expect(service.canLevelUp(180, 210)).toBe(true); // Level 2 to 3
      expect(service.canLevelUp(210, 220)).toBe(false); // Both level 3
      expect(service.canLevelUp(10, 500)).toBe(true); // Multiple level gain
    });
  });

  describe('levelUpHero', () => {
    it('should increase hero stats for a single level', () => {
      const hero: Hero = {
        name: 'Test Hero',
        health: 100,
        maxHealth: 100,
        attack: 12,
        defense: 8,
        luck: 5,
        speed: 15,
        level: 1,
        experience: 100
      };

      const leveledHero = service.levelUpHero(hero);

      expect(leveledHero.health).toBe(120);
      expect(leveledHero.attack).toBe(15);
      expect(leveledHero.defense).toBe(10);
      expect(leveledHero.luck).toBe(6);
      expect(leveledHero.name).toBe('Test Hero');
      expect(leveledHero.experience).toBe(100);
    });

    it('should increase hero stats for multiple levels', () => {
      const hero: Hero = {
        name: 'Test Hero',
        health: 100,
        maxHealth: 100,
        attack: 12,
        defense: 8,
        luck: 5,
        speed: 15,
        level: 1,
        experience: 100
      };

      const leveledHero = service.levelUpHero(hero, 3);

      expect(leveledHero.health).toBe(160);
      expect(leveledHero.attack).toBe(21);
      expect(leveledHero.defense).toBe(14);
      expect(leveledHero.luck).toBe(8);
    });
  });
  describe('validateHeroStats', () => {
    it('should validate correct hero stats', () => {
      const validHero: Hero = {
        name: 'Valid Hero',
        health: 100,
        maxHealth: 100,
        attack: 12,
        defense: 8,
        luck: 5,
        speed: 15,
        level: 1,
        experience: 0
      };

      expect(service.validateHeroStats(validHero)).toBe(true);
    });
    it('should reject hero with invalid stats', () => {
      const invalidHero: Hero = {
        name: 'Invalid Hero',
        health: 0,
        maxHealth: 100,
        attack: -5,
        defense: 8,
        luck: 5,
        speed: 15,
        level: 1,
        experience: 0
      };

      expect(service.validateHeroStats(invalidHero)).toBe(false);
    });
    it('should reject hero with stats too high', () => {
      const overpoweredHero: Hero = {
        name: 'OP Hero',
        health: 2000,
        maxHealth: 2000,
        attack: 200,
        defense: 200,
        luck: 100,
        speed: 50,
        level: 99,
        experience: 9999
      };

      expect(service.validateHeroStats(overpoweredHero)).toBe(false);
    });
  });
});
