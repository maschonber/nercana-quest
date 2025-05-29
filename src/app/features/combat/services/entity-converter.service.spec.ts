import { TestBed } from '@angular/core/testing';
import { EntityConverter } from './entity-converter.service';
import { Hero } from '../../hero/models/hero.model';
import { Monster, MonsterType } from '../../quest/models/monster.model';
import { CombatantType } from '../models/combat.model';

describe('EntityConverter', () => {
  let service: EntityConverter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EntityConverter]
    });
    service = TestBed.inject(EntityConverter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Hero Combatant Creation', () => {
    it('should correctly convert hero with maxHealth 100', () => {
      const hero: Hero = {
        name: 'Test Hero',
        health: 80,
        maxHealth: 100,
        attack: 15,
        defense: 10,
        speed: 12,
        luck: 8,
        level: 5,
        experience: 250
      };

      const combatant = service.createHeroCombatant(hero);

      expect(combatant.maxHealth).toBe(100);
      expect(combatant.health).toBe(80);
      expect(combatant.name).toBe('Test Hero');
      expect(combatant.type).toBe(CombatantType.HERO);
    });

    it('should correctly convert hero with maxHealth different from 100', () => {
      const hero: Hero = {
        name: 'Powerful Hero',
        health: 150,
        maxHealth: 200,
        attack: 25,
        defense: 20,
        speed: 15,
        luck: 12,
        level: 10,
        experience: 1000
      };

      const combatant = service.createHeroCombatant(hero);

      expect(combatant.maxHealth).toBe(200); // Should use hero's actual maxHealth, not hardcoded 100
      expect(combatant.health).toBe(150);
      expect(combatant.name).toBe('Powerful Hero');
      expect(combatant.type).toBe(CombatantType.HERO);
    });

    it('should correctly convert hero with very low maxHealth', () => {
      const hero: Hero = {
        name: 'Weak Hero',
        health: 20,
        maxHealth: 30,
        attack: 8,
        defense: 5,
        speed: 10,
        luck: 5,
        level: 1,
        experience: 0
      };

      const combatant = service.createHeroCombatant(hero);

      expect(combatant.maxHealth).toBe(30); // Should use hero's actual maxHealth, not hardcoded 100
      expect(combatant.health).toBe(20);
      expect(combatant.name).toBe('Weak Hero');
      expect(combatant.type).toBe(CombatantType.HERO);
    });

    it('should correctly convert hero with very high maxHealth', () => {
      const hero: Hero = {
        name: 'Tank Hero',
        health: 800,
        maxHealth: 1000,
        attack: 10,
        defense: 50,
        speed: 5,
        luck: 15,
        level: 20,
        experience: 5000
      };

      const combatant = service.createHeroCombatant(hero);

      expect(combatant.maxHealth).toBe(1000); // Should use hero's actual maxHealth, not hardcoded 100
      expect(combatant.health).toBe(800);
      expect(combatant.name).toBe('Tank Hero');
      expect(combatant.type).toBe(CombatantType.HERO);
    });
  });
  describe('Monster Combatant Creation', () => {
    it('should correctly convert monster', () => {
      const monster: Monster = {
        name: 'Space Slug',
        health: 25,
        maxHealth: 30,
        attack: 8,
        defense: 5,
        speed: 10,
        type: MonsterType.SPACE_SLUG,
        experienceReward: 50,
        description: 'A slimy space creature'
      };

      const combatant = service.createMonsterCombatant(monster);

      expect(combatant.maxHealth).toBe(30);
      expect(combatant.health).toBe(25);
      expect(combatant.name).toBe('Space Slug');
      expect(combatant.type).toBe(CombatantType.MONSTER);
    });
  });

  describe('Team Creation', () => {
    it('should correctly convert teams with mixed maxHealth values', () => {
      const heroes: Hero[] = [
        {
          name: 'Hero 1',
          health: 80,
          maxHealth: 100,
          attack: 15,
          defense: 10,
          speed: 12,
          luck: 8,
          level: 5,
          experience: 250
        },
        {
          name: 'Hero 2',
          health: 150,
          maxHealth: 200,
          attack: 20,
          defense: 15,
          speed: 10,
          luck: 10,
          level: 8,
          experience: 600
        }
      ];
      const monsters: Monster[] = [
        {
          name: 'Xriit Scout',
          health: 40,
          maxHealth: 50,
          attack: 12,
          defense: 8,
          speed: 8,
          type: MonsterType.XRIIT_SCOUT,
          experienceReward: 75,
          description: 'A fast alien scout'
        }
      ];

      const { heroTeam, enemyTeam } = service.createCombatantTeams(
        heroes,
        monsters
      );

      expect(heroTeam).toHaveLength(2);
      expect(heroTeam[0].maxHealth).toBe(100); // First hero's actual maxHealth
      expect(heroTeam[1].maxHealth).toBe(200); // Second hero's actual maxHealth

      expect(enemyTeam).toHaveLength(1);
      expect(enemyTeam[0].maxHealth).toBe(50);
    });
  });
});
