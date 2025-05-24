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
        attack: 12,
        defense: 8,
        luck: 5,
        level: 1,
        experience: 0,
        gold: 0
      };
      
      expect(service.calculateTotalPower(hero)).toBe(125);
    });
  });

  describe('calculateLevel', () => {
    it('should calculate level based on experience', () => {
      expect(service.calculateLevel(0)).toBe(1);
      expect(service.calculateLevel(99)).toBe(1);
      expect(service.calculateLevel(100)).toBe(2);
      expect(service.calculateLevel(250)).toBe(3);
    });
  });

  describe('getExperienceForNextLevel', () => {
    it('should calculate experience needed for next level', () => {
      expect(service.getExperienceForNextLevel(0)).toBe(100);
      expect(service.getExperienceForNextLevel(150)).toBe(200);
      expect(service.getExperienceForNextLevel(250)).toBe(300);
    });
  });

  describe('canLevelUp', () => {
    it('should determine if hero can level up', () => {
      expect(service.canLevelUp(50)).toBe(false);
      expect(service.canLevelUp(100)).toBe(true);
      expect(service.canLevelUp(150)).toBe(false);
      expect(service.canLevelUp(200)).toBe(true);
    });
  });
  describe('levelUpHero', () => {
    it('should increase hero stats when leveling up', () => {
      const hero: Hero = {
        name: 'Test Hero',
        health: 100,
        attack: 12,
        defense: 8,
        luck: 5,
        level: 1,
        experience: 100,
        gold: 50
      };

      const leveledHero = service.levelUpHero(hero);

      expect(leveledHero.health).toBe(105);
      expect(leveledHero.attack).toBe(14);
      expect(leveledHero.defense).toBe(10);
      expect(leveledHero.luck).toBe(6);
      expect(leveledHero.name).toBe('Test Hero');
      expect(leveledHero.level).toBe(1); // levelUpHero doesn't change level
      expect(leveledHero.experience).toBe(100);
      expect(leveledHero.gold).toBe(50);
    });
  });
  describe('validateHeroStats', () => {
    it('should validate correct hero stats', () => {
      const validHero: Hero = {
        name: 'Valid Hero',
        health: 100,
        attack: 12,
        defense: 8,
        luck: 5,
        level: 1,
        experience: 0,
        gold: 0
      };

      expect(service.validateHeroStats(validHero)).toBe(true);
    });

    it('should reject hero with invalid stats', () => {
      const invalidHero: Hero = {
        name: 'Invalid Hero',
        health: 0,
        attack: -5,
        defense: 8,
        luck: 5,
        level: 1,
        experience: 0,
        gold: 0
      };

      expect(service.validateHeroStats(invalidHero)).toBe(false);
    });

    it('should reject hero with stats too high', () => {
      const overpoweredHero: Hero = {
        name: 'OP Hero',
        health: 2000,
        attack: 200,
        defense: 200,
        luck: 100,
        level: 99,
        experience: 9999,
        gold: 9999
      };

      expect(service.validateHeroStats(overpoweredHero)).toBe(false);
    });
  });
});
