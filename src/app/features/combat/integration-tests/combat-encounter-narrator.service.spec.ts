import { TestBed } from '@angular/core/testing';
import { CombatEncounterNarratorService } from '../services/combat-encounter-narrator.service';
import { Combat, CombatOutcome, CombatantType, TeamSide, CombatActionType } from '../models/combat.model';
import { StatusEffectType } from '../models/status-effect.model';

describe('CombatEncounterNarratorService', () => {
  let service: CombatEncounterNarratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CombatEncounterNarratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  describe('generateEncounterNarrative', () => {
    it('should generate narrative for single enemy victory', () => {
      const combat = createMockCombat({
        outcome: CombatOutcome.HERO_VICTORY,
        enemies: [{ name: 'Moggo Warrior' }],
        turnCount: 3
      });

      const narrative = service.generateEncounterNarrative(combat);

      expect(narrative).toContain('Moggo Warrior');
      expect(narrative.length).toBeGreaterThan(20); // Ensure we have a substantial narrative
    });

    it('should generate narrative for dual enemy encounter', () => {
      const combat = createMockCombat({
        outcome: CombatOutcome.HERO_VICTORY,
        enemies: [{ name: 'Moggo Warrior' }, { name: 'Space Slug' }],
        turnCount: 5
      });

      const narrative = service.generateEncounterNarrative(combat);

      expect(narrative).toContain('Moggo Warrior');
      expect(narrative).toContain('Space Slug');
    });

    it('should generate narrative for multiple same-species enemies', () => {
      const combat = createMockCombat({
        outcome: CombatOutcome.HERO_VICTORY,
        enemies: [
          { name: 'Moggo Warrior' }, 
          { name: 'Moggo Brute' }, 
          { name: 'Moggo Scout' }
        ],
        turnCount: 8
      });

      const narrative = service.generateEncounterNarrative(combat);

      expect(narrative).toContain('Moggo');
      expect(narrative).toContain('3');
    });    it('should generate defeat narrative', () => {
      const combat = createMockCombat({
        outcome: CombatOutcome.HERO_DEFEAT,
        enemies: [{ name: 'Xriit Commander' }],
        turnCount: 4
      });

      const narrative = service.generateEncounterNarrative(combat);

      expect(narrative).toContain('Xriit Commander');
      // Check for defeat-related concepts rather than specific words
      expect(narrative.toLowerCase()).toMatch(/defeat|termination|eliminated|failed|catastrophic|destroyed|overwhelm/);
    });    it('should generate flee narrative', () => {
      const combat = createMockCombat({
        outcome: CombatOutcome.HERO_FLED,
        enemies: [{ name: 'Space Merc' }],
        turnCount: 2
      });      const narrative = service.generateEncounterNarrative(combat);

      expect(narrative).toContain('Space Merc');
      // Check for retreat/escape-related concepts rather than specific words
      expect(narrative.toLowerCase()).toMatch(/retreat|withdraw|withdrew|escape|fled|tactical.*retreat|emergency.*protocol/);
    });

    it('should describe different combat intensities appropriately', () => {
      // High intensity combat
      const highIntensityCombat = createMockCombat({
        outcome: CombatOutcome.HERO_VICTORY,
        enemies: [{ name: 'Elite Warrior' }],
        turnCount: 4,
        highDamage: true
      });
      
      const highIntensityNarrative = service.generateEncounterNarrative(highIntensityCombat);

      // Check for high-intensity combat descriptors (more flexible pattern)
      expect(highIntensityNarrative.toLowerCase()).toMatch(/brutal|devastating|fierce|relentless|desperate|struggle|heavy|casualties|intense|difficult|challenging|dangerous/);
    });
  });

  // Helper function to create mock combat objects for testing
  function createMockCombat(config: {
    outcome: CombatOutcome;
    enemies: { name: string }[];
    turnCount: number;
    statusEffects?: StatusEffectType[];
    highDamage?: boolean;
  }): Combat {
    const heroes = [{
      id: 'hero-1',
      name: 'Test Clone',
      health: 100,
      maxHealth: 100,
      attack: 20,
      defense: 10,
      speed: 15,
      type: CombatantType.HERO,
      isAlive: config.outcome !== CombatOutcome.HERO_DEFEAT,
      hasFled: config.outcome === CombatOutcome.HERO_FLED,
      statusEffects: []
    }];

    const enemies = config.enemies.map((enemy, index) => ({
      id: `enemy-${index}`,
      name: enemy.name,
      health: config.outcome === CombatOutcome.HERO_VICTORY ? 0 : 50,
      maxHealth: 50,
      attack: 15,
      defense: 8,
      speed: 12,
      type: CombatantType.MONSTER,
      isAlive: config.outcome !== CombatOutcome.HERO_VICTORY,
      hasFled: false,
      statusEffects: []
    }));

    const turns = Array.from({ length: config.turnCount }, (_, index) => ({
      turnNumber: index + 1,
      combatTime: (index + 1) * 50,
      actorId: index % 2 === 0 ? 'hero-1' : 'enemy-0',
      action: {
        type: CombatActionType.ATTACK,
        description: 'attacks',
        damage: config.highDamage ? 30 : 15,
        actorId: index % 2 === 0 ? 'hero-1' : 'enemy-0',
        actorName: index % 2 === 0 ? 'Test Clone' : config.enemies[0].name,
        targetId: index % 2 === 0 ? 'enemy-0' : 'hero-1',
        targetName: index % 2 === 0 ? config.enemies[0].name : 'Test Clone',
        success: true,
        statusEffects: config.statusEffects && index === 1 ? 
          config.statusEffects.map(type => ({
            type,
            name: type,
            description: `${type} effect`,
            duration: 100,
            stackable: false
          })) : undefined
      },
      actorHealthAfter: index % 2 === 0 ? 85 : 35,
      targetHealthAfter: index % 2 === 0 ? 35 : 85,
      heroHealthAfter: 85,
      monsterHealthAfter: 35
    }));

    return {
      heroTeam: {
        side: TeamSide.HERO,
        combatants: heroes
      },
      enemyTeam: {
        side: TeamSide.ENEMY,
        combatants: enemies
      },
      turns,
      currentTurn: config.turnCount,
      outcome: config.outcome
    };
  }
});
