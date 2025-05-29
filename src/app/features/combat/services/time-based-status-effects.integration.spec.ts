import { TestBed } from '@angular/core/testing';
import { TurnManager } from './turn-manager.service';
import { StatusEffectManager } from './status-effect-manager.service';
import { ActionExecutor } from './action-executor.service';
import { ActionFactory } from './actions/action.factory';
import { CombatStateManager } from './combat-state-manager.service';
import { CombatActionType, Combatant } from '../models/combat.model';
import { StatusEffectType, StatusEffectFactory } from '../models/status-effect.model';

describe('Time-based Status Effects Integration', () => {
  let statusEffectManager: StatusEffectManager;
  let turnManager: TurnManager;
  let actionExecutor: ActionExecutor;
  let stateManager: CombatStateManager;
  
  let hero: Combatant;
  let fastEnemy: Combatant;
  let slowEnemy: Combatant;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    statusEffectManager = TestBed.inject(StatusEffectManager);
    turnManager = TestBed.inject(TurnManager);
    actionExecutor = TestBed.inject(ActionExecutor);
    stateManager = TestBed.inject(CombatStateManager);
    
    // Create test combatants with different speeds
    hero = {
      id: 'hero1',
      name: 'Test Hero',
      health: 100,
      maxHealth: 100,
      attack: 20,
      defense: 10,
      speed: 20, // Fast hero
      type: 'hero' as any,
      isAlive: true,
      hasFled: false,
      statusEffects: []
    };

    fastEnemy = {
      id: 'enemy1',
      name: 'Fast Goblin',
      health: 40,
      maxHealth: 40,
      attack: 15,
      defense: 5,
      speed: 25, // Very fast enemy
      type: 'monster' as any,
      isAlive: true,
      hasFled: false,
      statusEffects: []
    };

    slowEnemy = {
      id: 'enemy2',
      name: 'Slow Orc',
      health: 80,
      maxHealth: 80,
      attack: 25,
      defense: 8,
      speed: 8, // Slow enemy
      type: 'monster' as any,
      isAlive: true,
      hasFled: false,
      statusEffects: []
    };
  });

  it('should properly manage status effect duration in multi-combatant scenario', () => {
    console.log('=== Time-based Status Effect Demonstration ===');
    
    // Initialize turn queue with all combatants
    const allCombatants = [hero, fastEnemy, slowEnemy];
    turnManager.initializeTurnQueue(allCombatants);
    
    const startTime = turnManager.getCurrentTime();
    console.log(`Combat start time: ${startTime}`);
    
    // Apply defend effect to hero
    const defendEffect = StatusEffectFactory.createDefending();
    statusEffectManager.applyStatusEffect(hero, defendEffect);
    
    const defendAppliedTime = turnManager.getCurrentTime();
    console.log(`Hero defends at time: ${defendAppliedTime}`);
    console.log(`Defend effect will expire at time: ${defendAppliedTime + defendEffect.duration}`);
    
    // Simulate multiple actions by different combatants
    let actionsWhileDefending = 0;
    let totalActions = 0;
    const maxActions = 15;
    
    while (totalActions < maxActions) {
      const nextActor = turnManager.getNextActor();
      if (!nextActor) break;
      
      const currentTime = turnManager.getCurrentTime();
      
      // Process status effects
      const result = statusEffectManager.processStatusEffects(hero);
      const stillDefending = statusEffectManager.hasStatusEffect(hero, StatusEffectType.DEFENDING);
      
      console.log(`Action ${totalActions + 1}: Time ${currentTime}, Actor: ${nextActor.name}, Hero Defending: ${stillDefending}`);
      
      if (stillDefending) {
        actionsWhileDefending++;
      }
      
      totalActions++;
      
      // If defending just ended, show the timing
      if (!stillDefending && actionsWhileDefending > 0) {
        console.log(`Defending effect ended after ${actionsWhileDefending} actions and ${currentTime - defendAppliedTime} time units`);
        break;
      }
    }
    
    console.log(`=== Results ===`);
    console.log(`Total actions while defending: ${actionsWhileDefending}`);
    console.log(`Final time: ${turnManager.getCurrentTime()}`);
    console.log(`Time elapsed: ${turnManager.getCurrentTime() - defendAppliedTime}`);
    
    // The key insight: With time-based status effects, the duration is consistent
    // regardless of how many different combatants act
    expect(actionsWhileDefending).toBeGreaterThan(2); // Should last more than just 2 actions
    expect(actionsWhileDefending).toBeLessThan(10); // But shouldn't last forever
    
    console.log('✓ Time-based status effects work correctly in multi-combatant scenario');
  });

  it('should show improved consistency compared to turn-based system', () => {
    console.log('=== Comparing Duration Consistency ===');
    
    // Test 1: Combat with 2 enemies (should get similar duration)
    turnManager.reset();
    turnManager.initializeTurnQueue([hero, fastEnemy, slowEnemy]);
    
    const defendEffect1 = StatusEffectFactory.createDefending();
    statusEffectManager.applyStatusEffect(hero, defendEffect1);
    
    let actions1 = 0;
    let maxActions = 12;
    while (actions1 < maxActions && statusEffectManager.hasStatusEffect(hero, StatusEffectType.DEFENDING)) {
      turnManager.getNextActor();
      statusEffectManager.processStatusEffects(hero);
      actions1++;
    }
    
    console.log(`Scenario 1 (2 enemies): Defending lasted ${actions1} actions`);
    
    // Test 2: Combat with just 1 enemy (should get similar duration)
    hero.statusEffects = []; // Reset
    turnManager.reset();
    turnManager.initializeTurnQueue([hero, fastEnemy]); // Only one enemy
    
    const defendEffect2 = StatusEffectFactory.createDefending();
    statusEffectManager.applyStatusEffect(hero, defendEffect2);
    
    let actions2 = 0;
    maxActions = 12;
    while (actions2 < maxActions && statusEffectManager.hasStatusEffect(hero, StatusEffectType.DEFENDING)) {
      turnManager.getNextActor();
      statusEffectManager.processStatusEffects(hero);
      actions2++;
    }
    
    console.log(`Scenario 2 (1 enemy): Defending lasted ${actions2} actions`);
    
    // With time-based system, the difference should be reasonable
    const difference = Math.abs(actions1 - actions2);
    console.log(`Difference in duration: ${difference} actions`);
    
    // The duration should be fairly consistent regardless of number of combatants
    expect(difference).toBeLessThanOrEqual(3); // Should be within 3 actions
    
    console.log('✓ Time-based system provides consistent duration across different combat scenarios');
  });

  it('should calculate correct damage reduction during defend effect', () => {
    console.log('=== Testing Defend Damage Reduction ===');
    
    turnManager.initializeTurnQueue([hero, fastEnemy]);
    
    // Apply defend effect
    const defendEffect = StatusEffectFactory.createDefending();
    statusEffectManager.applyStatusEffect(hero, defendEffect);
    
    // Check damage reduction
    const damageReduction = statusEffectManager.calculateDamageReduction(hero);
    console.log(`Damage reduction: ${damageReduction * 100}%`);
    
    expect(damageReduction).toBe(0.4); // 40% damage reduction
    expect(statusEffectManager.hasStatusEffect(hero, StatusEffectType.DEFENDING)).toBe(true);
    
    // Simulate some time passing
    turnManager.getNextActor();
    turnManager.getNextActor();
    turnManager.getNextActor();
    
    // Check if effect is still active
    statusEffectManager.processStatusEffects(hero);
    const stillActive = statusEffectManager.hasStatusEffect(hero, StatusEffectType.DEFENDING);
    console.log(`Defend effect still active after time progression: ${stillActive}`);
    
    if (stillActive) {
      const currentReduction = statusEffectManager.calculateDamageReduction(hero);
      expect(currentReduction).toBe(0.4); // Should still provide full reduction
    }
    
    console.log('✓ Damage reduction works correctly during defend effect duration');
  });
});
