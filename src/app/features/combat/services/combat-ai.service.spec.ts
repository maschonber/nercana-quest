import { TestBed } from '@angular/core/testing';
import { CombatAI } from './combat-ai.service';
import { StatusEffectManager } from './status-effect-manager.service';
import { RandomService } from '../../../shared/services/random.service';
import { 
  Combatant, 
  CombatActionType, 
  CombatantType, 
  CombatTeam, 
  TeamSide 
} from '../models/combat.model';
import { CombatAbility } from '../../quest/models/monster.model';
import { StatusEffectType } from '../models/status-effect.model';

describe('CombatAI', () => {
  let service: CombatAI;  let mockStatusEffectManager: any;
  let mockRandomService: any;
  let mockSlug: Combatant;
  let mockHero: Combatant;
  let opposingTeam: CombatTeam;
  beforeEach(() => {
    const statusEffectSpy = {
      hasStatusEffect: jest.fn()
    };
    const randomSpy = {
      rollDice: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        CombatAI,
        { provide: StatusEffectManager, useValue: statusEffectSpy },
        { provide: RandomService, useValue: randomSpy }
      ]
    });

    service = TestBed.inject(CombatAI);    mockStatusEffectManager = TestBed.inject(StatusEffectManager) as any;
    mockRandomService = TestBed.inject(RandomService) as any;

    mockSlug = {
      id: 'slug1',
      name: 'Space Slug',
      health: 20,
      maxHealth: 20,
      attack: 6,
      defense: 4,
      speed: 5,
      type: CombatantType.MONSTER,
      isAlive: true,
      hasFled: false,
      statusEffects: [],
      abilities: [CombatAbility.ATTACK, CombatAbility.POISON]
    };

    mockHero = {
      id: 'hero1',
      name: 'Test Hero',
      health: 30,
      maxHealth: 30,
      attack: 10,
      defense: 5,
      speed: 8,
      type: CombatantType.HERO,
      isAlive: true,
      hasFled: false,
      statusEffects: []
    };

    opposingTeam = {
      side: TeamSide.HERO,
      combatants: [mockHero]
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('poison attack logic', () => {
    beforeEach(() => {
      mockStatusEffectManager.hasStatusEffect.mockReturnValue(false);
    });    it('should use poison attack early in combat with high probability', () => {
      mockRandomService.rollDice.mockReturnValue(true);
      
      const action = service.determineAction(mockSlug, opposingTeam);
      
      expect(action).toBe(CombatActionType.SPECIAL);
    });

    it('should use poison attack when target is already poisoned', () => {      // Mock target having poison effect
      mockStatusEffectManager.hasStatusEffect.mockImplementation((combatant: any, effectType: any) => {
        return effectType === StatusEffectType.POISONED && combatant === mockHero;
      });
      mockRandomService.rollDice.mockReturnValue(true);
      
      const action = service.determineAction(mockSlug, opposingTeam);
      
      expect(action).toBe(CombatActionType.SPECIAL);
    });

    it('should not use poison if combatant does not have POISON ability', () => {
      const nonPoisonousMonster = {
        ...mockSlug,
        abilities: [CombatAbility.ATTACK, CombatAbility.DEFEND]
      };      
      mockRandomService.rollDice.mockReturnValue(true);
      
      const action = service.determineAction(nonPoisonousMonster, opposingTeam);
      
      expect(action).not.toBe(CombatActionType.SPECIAL);
    });    it('should fall back to attack or defend when not using poison', () => {
      mockRandomService.rollDice.mockReturnValue(false);
      
      const action = service.determineAction(mockSlug, opposingTeam);      
      expect([CombatActionType.ATTACK, CombatActionType.DEFEND]).toContain(action);
    });    it('should prefer defend when health is low and not already defending', () => {
      mockSlug.health = 5; // 25% health
      mockSlug.abilities = [CombatAbility.ATTACK, CombatAbility.POISON, CombatAbility.DEFEND]; // Add DEFEND ability
      mockHero.health = 25; // Hero is not at full health to avoid early combat poison logic
      mockRandomService.rollDice.mockImplementation((probability: number) => {
        // Return true only for defend probability (0.3) but false for all poison probabilities
        if (probability === 0.3) return true; // defend probability at 25% health
        return false; // false for poison probabilities (0.7, 0.6, 0.15)
      });
      
      const action = service.determineAction(mockSlug, opposingTeam);
      
      expect(action).toBe(CombatActionType.DEFEND);
    });
  });

  describe('target selection', () => {
    it('should select the only available target', () => {
      const target = service.selectTarget(opposingTeam);
      
      expect(target).toBe(mockHero);
    });

    it('should not select dead or fled combatants', () => {
      mockHero.isAlive = false;
      
      const target = service.selectTarget(opposingTeam);
      
      expect(target).toBeNull();
    });

    it('should return null when no targets are available', () => {
      opposingTeam.combatants = [];
      
      const target = service.selectTarget(opposingTeam);
      
      expect(target).toBeNull();
    });
  });
});
