import { TestBed } from '@angular/core/testing';
import { CombatAI } from '../services/combat-ai.service';
import { StatusEffectManager } from '../services/status-effect-manager.service';
import { RandomService, TestRandomProvider } from '../../../shared';
import { Combatant, CombatActionType, CombatantType, CombatTeam, TeamSide } from '../models/combat.model';
import { MonsterType, CombatAbility } from '../../quest/models/monster.model';

describe('Combat Abilities System Integration Test', () => {
  let combatAI: CombatAI;
  let randomService: RandomService;
  let testRandomProvider: TestRandomProvider;
  let statusEffectManager: StatusEffectManager;
  
  beforeEach(() => {
    testRandomProvider = new TestRandomProvider();
    
    TestBed.configureTestingModule({
      providers: [
        CombatAI,
        StatusEffectManager,
        { provide: RandomService, useValue: testRandomProvider }
      ]
    });
    
    combatAI = TestBed.inject(CombatAI);
    randomService = TestBed.inject(RandomService);
    statusEffectManager = TestBed.inject(StatusEffectManager);
  });

  describe('Monster Combat Abilities', () => {
    it('should allow monsters with DEFEND ability to use defend action', () => {
      // Create a monster with the DEFEND ability
      const monster: Combatant = {
        id: 'monster-1',
        name: 'Moggo Brute',
        type: CombatantType.MONSTER,
        health: 30,
        maxHealth: 100,
        attack: 15,
        defense: 10,
        speed: 8,
        isAlive: true,
        hasFled: false,
        abilities: [CombatAbility.ATTACK, CombatAbility.DEFEND],
        statusEffects: []
      };
      
      // Create a hero team
      const heroTeam: CombatTeam = {
        side: TeamSide.HERO,
        combatants: [{
          id: 'hero-1',
          name: 'Adventurer',
          type: CombatantType.HERO,
          health: 50,
          maxHealth: 100,
          attack: 20,
          defense: 15,
          speed: 10,
          isAlive: true,
          hasFled: false,
          abilities: [CombatAbility.ATTACK, CombatAbility.DEFEND],
          statusEffects: []
        }]
      };        // Mock the randomService to trigger defending behavior
      // Set monster to low health and high probability to defend
      monster.health = 20; // 20% health
      testRandomProvider.setSequence([0.1, 0.05, 0.02]); // Low values to pass rollDice checks (≤25% health needs ≤0.3)
      
      // Get the action determined by the AI
      const action = combatAI.determineAction(monster, heroTeam);
      
      // Expect monster to defend when at low health and having the DEFEND ability
      expect(action).toBe(CombatActionType.DEFEND);
    });

    it('should never use defend action for monsters without DEFEND ability', () => {
      // Create a monster without the DEFEND ability
      const monster: Combatant = {
        id: 'monster-1',
        name: 'Space Slug',
        type: CombatantType.MONSTER,
        health: 20,
        maxHealth: 100,
        attack: 15,
        defense: 10,
        speed: 8,
        isAlive: true,
        hasFled: false,
        abilities: [CombatAbility.ATTACK], // Only has ATTACK
        statusEffects: []
      };
      
      // Create a hero team
      const heroTeam: CombatTeam = {
        side: TeamSide.HERO,
        combatants: [{
          id: 'hero-1',
          name: 'Adventurer',
          type: CombatantType.HERO,
          health: 50,
          maxHealth: 100,
          attack: 20,
          defense: 15,
          speed: 10,
          isAlive: true,
          hasFled: false,
          abilities: [CombatAbility.ATTACK, CombatAbility.DEFEND],
          statusEffects: []
        }]
      };        // Mock the randomService to try to trigger defending behavior
      // Set monster to low health and high probability to defend
      monster.health = 20; // 20% health
      testRandomProvider.setSequence([0.1, 0.05, 0.02]); // Low values that would pass rollDice if ability available (≤25% health needs ≤0.3)
      
      // Get the action determined by the AI
      const action = combatAI.determineAction(monster, heroTeam);
      
      // Expect monster to NEVER defend even at low health when missing the DEFEND ability
      expect(action).toBe(CombatActionType.ATTACK);
    });

    it('should allow all monsters to use ATTACK ability', () => {
      // Create different monster types, all with at least ATTACK ability
      const monsters = [
        {
          id: 'monster-slug',
          name: 'Space Slug',
          type: CombatantType.MONSTER,
          health: 80,
          maxHealth: 100,
          attack: 15,
          defense: 10,
          speed: 8,
          isAlive: true,
          hasFled: false,
          abilities: [CombatAbility.ATTACK],
          statusEffects: []
        },
        {
          id: 'monster-moggo',
          name: 'Moggo Brute',
          type: CombatantType.MONSTER,
          health: 80,
          maxHealth: 100,
          attack: 25,
          defense: 15,
          speed: 10,
          isAlive: true,
          hasFled: false,
          abilities: [CombatAbility.ATTACK, CombatAbility.DEFEND],
          statusEffects: []
        }
      ];
      
      // Create a hero team
      const heroTeam: CombatTeam = {
        side: TeamSide.HERO,
        combatants: [{
          id: 'hero-1',
          name: 'Adventurer',
          type: CombatantType.HERO,
          health: 50,
          maxHealth: 100,
          attack: 20,
          defense: 15,
          speed: 10,
          isAlive: true,
          hasFled: false,
          abilities: [CombatAbility.ATTACK, CombatAbility.DEFEND],
          statusEffects: []
        }]
      };        // Test with high health where monsters should choose to attack
      testRandomProvider.setSequence([0.9, 0.9, 0.9, 0.9, 0.9, 0.9]); // High values that will fail all rollDice checks, forcing attack
      
      // All monsters should be able to attack
      for (const monster of monsters) {
        const action = combatAI.determineAction(monster, heroTeam);
        expect(action).toBe(CombatActionType.ATTACK);
        // Additional context for the test
        console.log(`Monster ${monster.name} with abilities ${monster.abilities} uses ${action}`);
      }
    });
    
    it('should only allow monsters with DEFEND to defend when appropriate', () => {
      // Create various monster types with different abilities
      const monsters = [
        // Monster with only ATTACK
        {
          id: 'monster-slug',
          name: 'Space Slug',
          type: CombatantType.MONSTER,
          health: 25, // Low health (25%)
          maxHealth: 100,
          attack: 15,
          defense: 10,
          speed: 8,
          isAlive: true,
          hasFled: false,
          abilities: [CombatAbility.ATTACK],
          statusEffects: []
        },
        // Monster with ATTACK and DEFEND
        {
          id: 'monster-moggo',
          name: 'Moggo Brute',
          type: CombatantType.MONSTER,
          health: 25, // Low health (25%)
          maxHealth: 100,
          attack: 25,
          defense: 15,
          speed: 10,
          isAlive: true,
          hasFled: false,
          abilities: [CombatAbility.ATTACK, CombatAbility.DEFEND],
          statusEffects: []
        }
      ];
      
      // Create a hero team
      const heroTeam: CombatTeam = {
        side: TeamSide.HERO,
        combatants: [{
          id: 'hero-1',
          name: 'Adventurer',
          type: CombatantType.HERO,
          health: 50,
          maxHealth: 100,
          attack: 20,
          defense: 15,
          speed: 10,
          isAlive: true,
          hasFled: false,
          abilities: [CombatAbility.ATTACK, CombatAbility.DEFEND],
          statusEffects: []
        }]
      };        // Force defending behavior
      testRandomProvider.setSequence([0.1, 0.05, 0.02, 0.1, 0.05, 0.02]); // Low values to pass rollDice checks for both monsters
      
      // Test each monster
      for (const monster of monsters) {
        const action = combatAI.determineAction(monster, heroTeam);
        
        if (monster.abilities.includes(CombatAbility.DEFEND)) {
          // Monster with DEFEND ability should choose to defend when appropriate
          expect(action).toBe(CombatActionType.DEFEND);
          console.log(`Monster ${monster.name} with DEFEND ability defended at low health`);
        } else {
          // Monster without DEFEND ability should never defend
          expect(action).toBe(CombatActionType.ATTACK);
          console.log(`Monster ${monster.name} without DEFEND ability attacks even at low health`);
        }
      }
    });
  });
});
