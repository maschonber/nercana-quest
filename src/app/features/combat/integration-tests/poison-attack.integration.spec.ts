import { TestBed } from '@angular/core/testing';
import { CombatService } from '../services/combat.service';
import { CombatResult, CombatTurn } from '../models/combat.model';
import { Hero } from '../../hero/models/hero.model';
import { Monster, MonsterType, CombatAbility } from '../../quest/models/monster.model';
import { StatusEffectType, StatusEffect } from '../models/status-effect.model';
import { RandomService, ProductionRandomProvider } from '../../../shared/services/random.service';

describe('Poison Attack Integration', () => {
  let combatService: CombatService;
  let randomService: RandomService;
  let testHero: Hero;
  let poisonousSlug: Monster;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductionRandomProvider,
        RandomService
      ]
    });
    combatService = TestBed.inject(CombatService);
    randomService = TestBed.inject(RandomService);    // Create a deterministic random service for testing
    jest.spyOn(randomService, 'rollDice').mockReturnValue(true);
    jest.spyOn(randomService, 'randomChoice').mockImplementation((arr: unknown[]) => arr[0]);

    testHero = {
      name: 'Test Hero',
      level: 3,
      health: 50,
      maxHealth: 50,
      attack: 12,
      defense: 8,
      speed: 10,
      luck: 5,
      experience: 100
    };

    poisonousSlug = {
      type: MonsterType.SPACE_SLUG,
      name: 'Poisonous Slug',
      health: 25,
      maxHealth: 25,
      attack: 8,
      defense: 4,
      speed: 6,
      experienceReward: 15,
      description: 'A toxic slug with poison abilities',
      abilities: [CombatAbility.ATTACK, CombatAbility.POISON]
    };
  });
  it('should allow slugs to use poison attacks in combat', () => {
    // Force the AI to use poison by mocking rollDice for early combat
    jest.spyOn(randomService, 'rollDice').mockReturnValue(true);

    const result: CombatResult = combatService.createTeamCombat([testHero], [poisonousSlug]);

    expect(result).toBeDefined();
    expect(result.turns.length).toBeGreaterThan(0);    // Check if any turn contains a poison attack
    const poisonTurns = result.turns.filter((turn: CombatTurn) => 
      turn.action.type === 'special' && 
      turn.action.description.includes('poison')
    );

    expect(poisonTurns.length).toBeGreaterThan(0);
  });
  it('should apply stacking poison effects over multiple turns', () => {
    // Mock the AI to prefer poison attacks
    let callCount = 0;
    jest.spyOn(randomService, 'rollDice').mockImplementation(() => {
      callCount++;
      // Use poison for first few turns, then normal attacks
      return callCount <= 3;
    });

    const result: CombatResult = combatService.createTeamCombat([testHero], [poisonousSlug]);    // Find turns where poison was applied
    const poisonTurns = result.turns.filter((turn: CombatTurn) => 
      turn.action.statusEffects?.some((effect: StatusEffect) => effect.type === StatusEffectType.POISONED)
    );

    expect(poisonTurns.length).toBeGreaterThan(0);

    // Check if damage increases with stacks
    if (poisonTurns.length > 1) {
      const firstPoisonDamage = poisonTurns[0].action.statusEffects?.find(
        (effect: StatusEffect) => effect.type === StatusEffectType.POISONED
      )?.damageOverTime;

      const secondPoisonDamage = poisonTurns[1].action.statusEffects?.find(
        (effect: StatusEffect) => effect.type === StatusEffectType.POISONED
      )?.damageOverTime;

      if (firstPoisonDamage && secondPoisonDamage) {
        expect(secondPoisonDamage).toBeGreaterThan(firstPoisonDamage);
      }
    }
  });
  it('should show poison effects in combat log descriptions', () => {
    jest.spyOn(randomService, 'rollDice').mockReturnValue(true);

    const result: CombatResult = combatService.createTeamCombat([testHero], [poisonousSlug]);    const poisonTurns = result.turns.filter((turn: CombatTurn) => 
      turn.action.description.includes('toxic') || 
      turn.action.description.includes('poison')
    );

    expect(poisonTurns.length).toBeGreaterThan(0);
    
    // Check description content
    const firstPoisonTurn = poisonTurns[0];
    expect(firstPoisonTurn.action.description).toMatch(/toxic secretions|intensifies.*poison/);
  });
  it('should ensure poison lasts for 300 clicks as specified', () => {
    jest.spyOn(randomService, 'rollDice').mockReturnValue(true);

    const result: CombatResult = combatService.createTeamCombat([testHero], [poisonousSlug]);    const poisonTurn = result.turns.find((turn: CombatTurn) => 
      turn.action.statusEffects?.some((effect: StatusEffect) => effect.type === StatusEffectType.POISONED)
    );

    if (poisonTurn) {
      const poisonEffect = poisonTurn.action.statusEffects?.find(
        (effect: StatusEffect) => effect.type === StatusEffectType.POISONED
      );
      
      expect(poisonEffect?.duration).toBe(300);
    }
  });

  it('should not allow non-slug monsters to use poison', () => {
    const nonSlugMonster: Monster = {
      type: MonsterType.XRIIT,
      name: 'Xriit Warrior',
      health: 30,
      maxHealth: 30,
      attack: 12,
      defense: 8,
      speed: 9,
      experienceReward: 20,
      description: 'A tactical alien warrior',
      abilities: [CombatAbility.ATTACK, CombatAbility.DEFEND]
    };

    const result: CombatResult = combatService.createTeamCombat([testHero], [nonSlugMonster]);    // Check that no poison attacks were used
    const poisonTurns = result.turns.filter((turn: CombatTurn) => 
      turn.action.type === 'special' && 
      turn.action.description.includes('poison')
    );

    expect(poisonTurns.length).toBe(0);
  });
});
