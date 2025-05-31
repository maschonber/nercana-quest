import { TestBed } from '@angular/core/testing';
import { CombatAI } from './combat-ai.service';
import { RandomService, TestRandomProvider } from '../../../shared';
import { Combatant, CombatantType, CombatActionType, CombatTeam, TeamSide } from '../models/combat.model';
import { StatusEffectManager } from './status-effect-manager.service';
import { CombatAbility } from '../../quest/models/monster.model';

describe('CombatAI with TestRandomProvider', () => {
  let service: CombatAI;
  let testRandomProvider: TestRandomProvider;

  beforeEach(() => {
    testRandomProvider = new TestRandomProvider();
    
    TestBed.configureTestingModule({
      providers: [
        CombatAI,
        StatusEffectManager,
        { provide: RandomService, useValue: testRandomProvider }
      ]
    });
    
    service = TestBed.inject(CombatAI);
  });

  describe('deterministic action decisions', () => {
    it('should make predictable monster defend decisions', () => {      const monster: Combatant = {
        id: 'test-monster',
        name: 'Test Monster',
        type: CombatantType.MONSTER,
        health: 20,
        maxHealth: 100, // 20% health - damaged
        attack: 50,
        defense: 20,
        speed: 30,
        isAlive: true,
        hasFled: false,
        statusEffects: [],
        abilities: [CombatAbility.ATTACK, CombatAbility.DEFEND]
      };

      const opposingTeam: CombatTeam = {
        side: TeamSide.HERO,
        combatants: [
          {
            id: 'test-hero',
            name: 'Test Hero',
            type: CombatantType.HERO,
            health: 100,
            maxHealth: 100,
            attack: 60,
            defense: 30,
            speed: 35,
            isAlive: true,
            hasFled: false,
            statusEffects: []
          }
        ]
      };

      // Set up sequence to make defend check pass for wounded monster
      testRandomProvider.setSequence([0.1]); // Will pass defend check (0.1 < 0.3 for 20% health)
      
      const action = service.determineAction(monster, opposingTeam);
      expect(action).toBe(CombatActionType.DEFEND);
    });

    it('should make predictable monster attack decisions', () => {      const monster: Combatant = {
        id: 'test-monster',
        name: 'Test Monster',
        type: CombatantType.MONSTER,
        health: 80,
        maxHealth: 100, // 80% health - healthy
        attack: 50,
        defense: 20,
        speed: 30,
        isAlive: true,
        hasFled: false,
        statusEffects: [],
        abilities: [CombatAbility.ATTACK, CombatAbility.DEFEND]
      };

      const opposingTeam: CombatTeam = {
        side: TeamSide.HERO,
        combatants: [
          {
            id: 'test-hero',
            name: 'Test Hero',
            type: CombatantType.HERO,
            health: 100,
            maxHealth: 100,
            attack: 60,
            defense: 30,
            speed: 35,
            isAlive: true,
            hasFled: false,
            statusEffects: []
          }
        ]
      };

      // Set up sequence to make defend check fail for healthy monster
      testRandomProvider.setSequence([0.9]); // Will fail defend check (0.9 > 0.05 for healthy monster)
      
      const action = service.determineAction(monster, opposingTeam);
      expect(action).toBe(CombatActionType.ATTACK);
    });

    it('should make predictable target selection', () => {
      const hero1: Combatant = {
        id: 'hero-1',
        name: 'Hero 1',
        type: CombatantType.HERO,
        health: 100,
        maxHealth: 100,
        attack: 60,
        defense: 30,
        speed: 35,
        isAlive: true,
        hasFled: false,
        statusEffects: []
      };

      const hero2: Combatant = {
        id: 'hero-2',
        name: 'Hero 2',
        type: CombatantType.HERO,
        health: 20, // Low health - should be prioritized
        maxHealth: 100,
        attack: 70,
        defense: 25,
        speed: 40,
        isAlive: true,
        hasFled: false,
        statusEffects: []
      };

      const opposingTeam: CombatTeam = {
        side: TeamSide.HERO,
        combatants: [hero1, hero2]
      };

      // Set up sequence for deterministic randomization factor in target selection
      testRandomProvider.setSequence([0.5, 0.5]); // Neutral variance for both targets
      
      const target = service.selectTarget(opposingTeam);
      
      // Should select hero2 due to low health (high priority target)
      expect(target?.id).toBe('hero-2');
    });

    it('should have consistent behavior across multiple calls', () => {      const monster: Combatant = {
        id: 'test-monster',
        name: 'Test Monster',
        type: CombatantType.MONSTER,
        health: 80,
        maxHealth: 100,
        attack: 50,
        defense: 20,
        speed: 30,
        isAlive: true,
        hasFled: false,
        statusEffects: [],
        abilities: [CombatAbility.ATTACK, CombatAbility.DEFEND]
      };

      const opposingTeam: CombatTeam = {
        side: TeamSide.HERO,
        combatants: [
          {
            id: 'test-hero',
            name: 'Test Hero',
            type: CombatantType.HERO,
            health: 100,
            maxHealth: 100,
            attack: 60,
            defense: 30,
            speed: 35,
            isAlive: true,
            hasFled: false,
            statusEffects: []
          }
        ]
      };

      // Set up a repeating sequence for consistent behavior
      testRandomProvider.setSequence([0.9, 0.9]); // Both calls should fail defend check
      
      const firstAction = service.determineAction(monster, opposingTeam);
      const secondAction = service.determineAction(monster, opposingTeam);
      
      expect(firstAction).toBe(CombatActionType.ATTACK);
      expect(secondAction).toBe(CombatActionType.ATTACK);
    });
  });
});
