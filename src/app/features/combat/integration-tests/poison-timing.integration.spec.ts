import { TestBed } from '@angular/core/testing';
import { CombatStateManager } from '../services/combat-state-manager.service';
import { StatusEffectManager } from '../services/status-effect-manager.service';
import { TurnManager } from '../services/turn-manager.service';
import { Combat, Combatant, CombatOutcome, TeamSide, CombatTeam } from '../models/combat.model';
import { StatusEffect, StatusEffectType, StatusEffectFactory } from '../models/status-effect.model';
import { ProductionRandomProvider } from '../../../shared/services/random.service';

describe('Poison Timing Integration', () => {
  let stateManager: CombatStateManager;
  let statusEffectManager: StatusEffectManager;
  let turnManager: TurnManager;
  
  let hero: Combatant;
  let monster: Combatant;
  let combat: Combat;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductionRandomProvider, TurnManager]
    });

    stateManager = TestBed.inject(CombatStateManager);
    statusEffectManager = TestBed.inject(StatusEffectManager);
    turnManager = TestBed.inject(TurnManager);

    // Create test combatants
    hero = {
      id: 'hero1',
      name: 'Test Hero',
      health: 100,
      maxHealth: 100,
      attack: 20,
      defense: 10,
      speed: 15,
      type: 'hero' as any,
      isAlive: true,
      hasFled: false,
      statusEffects: []
    };

    monster = {
      id: 'monster1',
      name: 'Poisonous Creature',
      health: 50,
      maxHealth: 50,
      attack: 15,
      defense: 5,
      speed: 10,
      type: 'monster' as any,
      isAlive: true,
      hasFled: false,
      statusEffects: []
    };    // Initialize combat state
    combat = stateManager.createCombatState([hero], [monster]);
    
    // Update references to point to the actual combat objects
    hero = combat.heroTeam.combatants[0];
    monster = combat.enemyTeam.combatants[0];
  });

  // Helper function to mock the current time for status effect processing
  function mockCurrentTime(time: number) {
    jest.spyOn(turnManager, 'getCurrentTime').mockReturnValue(time);
  }  it('should process poison damage at 100-time-unit intervals', () => {
    // Create poison effect that lasts 500 time units
    const poisonEffect = StatusEffectFactory.createPoisoned(500, 5);
    
    // Apply poison to hero (at time 0)    mockCurrentTime(0);
    statusEffectManager.applyStatusEffect(hero, poisonEffect);
      // Track initial health
    const initialHealth = hero.health;

    // Process time-based effects at time 100 (first poison tick)
    mockCurrentTime(100);
    const result1 = stateManager.processTimeBasedStatusEffects(combat, 100);
    
    // Verify first poison damage occurred
    expect(hero.health).toBe(initialHealth - 5);
    expect(result1.shouldCreateTurn).toBe(true);
    expect(result1.statusMessages).toContain('Test Hero takes 5 poison damage!');
    
    const healthAfterFirstTick = hero.health;    // Process time-based effects at time 200 (second poison tick)
    mockCurrentTime(200);
    const result2 = stateManager.processTimeBasedStatusEffects(combat, 200);
    
    // Verify second poison damage occurred
    expect(hero.health).toBe(healthAfterFirstTick - 5);
    expect(result2.shouldCreateTurn).toBe(true);
    expect(result2.statusMessages).toContain('Test Hero takes 5 poison damage!');

    // Process time-based effects at time 250 (no poison tick, only 50 units passed)
    mockCurrentTime(250);
    const result3 = stateManager.processTimeBasedStatusEffects(combat, 250);
    
    // Verify no additional damage (not a full 100-unit interval since last tick)
    expect(hero.health).toBe(healthAfterFirstTick - 5);
    expect(result3.shouldCreateTurn).toBe(false);
    expect(result3.statusMessages).toHaveLength(0);    // Process time-based effects at time 300 (third poison tick)
    mockCurrentTime(300);
    const result4 = stateManager.processTimeBasedStatusEffects(combat, 300);
    
    // Verify third poison damage occurred
    expect(hero.health).toBe(healthAfterFirstTick - 10);
    expect(result4.shouldCreateTurn).toBe(true);
    expect(result4.statusMessages).toContain('Test Hero takes 5 poison damage!');
  });
  it('should indicate when special turns should be created for poison damage', () => {
    // Create poison effect
    const poisonEffect = StatusEffectFactory.createPoisoned(300, 8);
    
    // Apply poison at time 0
    mockCurrentTime(0);
    statusEffectManager.applyStatusEffect(hero, poisonEffect);

    // Track initial status
    const initialTurnCount = combat.turns.length;

    // Process time-based effects at poison tick time
    mockCurrentTime(100);
    const result = stateManager.processTimeBasedStatusEffects(combat, 100);

    // Verify that the system indicates a special turn should be created
    expect(result.shouldCreateTurn).toBe(true);    expect(result.statusMessages.length).toBeGreaterThan(0);
    expect(result.statusMessages).toContain('Test Hero takes 8 poison damage!');
    
    // Verify poison damage was applied
    expect(hero.health).toBe(92);
  });

  it('should expire poison effects after duration', () => {
    // Create poison effect that lasts 250 time units (2.5 ticks)
    const poisonEffect = StatusEffectFactory.createPoisoned(250, 5);
    
    // Apply poison at time 0
    mockCurrentTime(0);
    statusEffectManager.applyStatusEffect(hero, poisonEffect);    // Verify poison is active
    expect(hero.statusEffects.length).toBe(1);
    expect(hero.statusEffects[0].type).toBe(StatusEffectType.POISONED);
    expect(hero.statusEffects[0].damageOverTime).toBe(5);

    // First tick at time 100
    mockCurrentTime(100);
    const result1 = stateManager.processTimeBasedStatusEffects(combat, 100);
    expect(hero.health).toBe(95);
    expect(result1.statusMessages).toContain('Test Hero takes 5 poison damage!');    // Second tick at time 200
    mockCurrentTime(200);
    const result2 = stateManager.processTimeBasedStatusEffects(combat, 200);
    expect(hero.health).toBe(90);
    expect(result2.statusMessages).toContain('Test Hero takes 5 poison damage!');

    // Third tick at time 300 - poison should be expired
    mockCurrentTime(300);
    const result3 = stateManager.processTimeBasedStatusEffects(combat, 300);
    
    // Health should remain 90 (no third tick of damage due to expiration)
    expect(hero.health).toBe(90);
    
    // Should report that the poison effect expired
    expect(result3.statusMessages.some(msg => 
      msg.includes('Test Hero\'s') && msg.includes('effect has worn off')
    )).toBe(true);
    
    // Poison should be removed from active effects
    expect(hero.statusEffects.find(effect => effect.type === StatusEffectType.POISONED)).toBeUndefined();
  });  it('should handle multiple poison effects with stacking behavior using fixed global intervals', () => {
    // Create two poison effects with different damage
    const firstPoison = StatusEffectFactory.createPoisoned(200, 3);
    const secondPoison = StatusEffectFactory.createPoisoned(300, 7);
    
    // Apply first poison at time 0
    mockCurrentTime(0);
    statusEffectManager.applyStatusEffect(hero, firstPoison);
    
    // Verify first poison is active
    expect(hero.statusEffects.length).toBe(1);
    expect(hero.statusEffects[0].damageOverTime).toBe(3);
    expect(hero.statusEffects[0].expiresAt).toBe(200);

    // Apply second poison at time 50 - should stack with first but NOT reset timer
    mockCurrentTime(50);
    statusEffectManager.applyStatusEffect(hero, secondPoison);
    
    // Should still have only one poison effect, with combined damage but extended expiration
    expect(hero.statusEffects.length).toBe(1);
    expect(hero.statusEffects[0].damageOverTime).toBe(10); // 3 + 7 = 10
    expect(hero.statusEffects[0].expiresAt).toBe(350); // max(200, 50+300) = 350
    expect(hero.statusEffects[0].appliedAt).toBe(0); // Original application time preserved

    // Initial health
    expect(hero.health).toBe(100);

    // First tick at time 100 (global interval) - combined poison should apply
    mockCurrentTime(100);
    const result1 = stateManager.processTimeBasedStatusEffects(combat, 100);
    expect(hero.health).toBe(90); // 100 - 10 = 90
    expect(result1.statusMessages.filter(msg => msg.includes('poison damage')).length).toBe(1);
    expect(result1.statusMessages[0]).toContain('takes 10 poison damage');

    // Second tick at time 200 (global interval) - stacked poison should still apply
    mockCurrentTime(200);
    const result2 = stateManager.processTimeBasedStatusEffects(combat, 200);
    expect(hero.health).toBe(80); // 90 - 10 = 80
    expect(result2.statusMessages.filter(msg => msg.includes('poison damage')).length).toBe(1);

    // Third tick at time 300 (global interval) - stacked poison should still apply
    mockCurrentTime(300);
    const result3 = stateManager.processTimeBasedStatusEffects(combat, 300);
    expect(hero.health).toBe(70); // 80 - 10 = 70
    expect(result3.statusMessages.filter(msg => msg.includes('poison damage')).length).toBe(1);

    // Fourth tick at time 400 (global interval) - poison should be expired (expires at 350)
    mockCurrentTime(400);
    const result4 = stateManager.processTimeBasedStatusEffects(combat, 400);
    expect(hero.health).toBe(70); // No damage, poison expired
    expect(result4.statusMessages.some(msg => msg.includes('effect has worn off'))).toBe(true);
    expect(hero.statusEffects.find(effect => effect.type === StatusEffectType.POISONED)).toBeUndefined();
  });

  it('should use fixed global intervals regardless of when poison is applied', () => {
    // Apply poison at time 25 (not a multiple of 100)
    mockCurrentTime(25);
    const poison = StatusEffectFactory.createPoisoned(300, 5);
    statusEffectManager.applyStatusEffect(hero, poison);
    
    expect(hero.statusEffects.length).toBe(1);
    expect(hero.statusEffects[0].appliedAt).toBe(25);
    expect(hero.health).toBe(100);

    // At time 50 - no damage yet (not a global interval)
    mockCurrentTime(50);
    const result1 = stateManager.processTimeBasedStatusEffects(combat, 50);
    expect(hero.health).toBe(100); // No damage
    expect(result1.statusMessages.filter(msg => msg.includes('poison damage')).length).toBe(0);

    // At time 100 - first global interval, poison should tick
    mockCurrentTime(100);
    const result2 = stateManager.processTimeBasedStatusEffects(combat, 100);
    expect(hero.health).toBe(95); // 100 - 5 = 95
    expect(result2.statusMessages.filter(msg => msg.includes('poison damage')).length).toBe(1);

    // At time 150 - not a global interval, no damage
    mockCurrentTime(150);
    const result3 = stateManager.processTimeBasedStatusEffects(combat, 150);
    expect(hero.health).toBe(95); // No change
    expect(result3.statusMessages.filter(msg => msg.includes('poison damage')).length).toBe(0);

    // At time 200 - second global interval, poison should tick again
    mockCurrentTime(200);
    const result4 = stateManager.processTimeBasedStatusEffects(combat, 200);
    expect(hero.health).toBe(90); // 95 - 5 = 90
    expect(result4.statusMessages.filter(msg => msg.includes('poison damage')).length).toBe(1);

    // At time 300 - third global interval, poison should tick again
    mockCurrentTime(300);
    const result5 = stateManager.processTimeBasedStatusEffects(combat, 300);
    expect(hero.health).toBe(85); // 90 - 5 = 85
    expect(result5.statusMessages.filter(msg => msg.includes('poison damage')).length).toBe(1);

    // At time 400 - poison expired (expires at 325), no damage
    mockCurrentTime(400);
    const result6 = stateManager.processTimeBasedStatusEffects(combat, 400);
    expect(hero.health).toBe(85); // No change
    expect(result6.statusMessages.some(msg => msg.includes('effect has worn off'))).toBe(true);
  });

  it('should demonstrate improved stacking - reapplying poison maintains global intervals', () => {
    // Apply first poison at time 0
    mockCurrentTime(0);
    const firstPoison = StatusEffectFactory.createPoisoned(200, 3);
    statusEffectManager.applyStatusEffect(hero, firstPoison);
    
    // First tick at time 100
    mockCurrentTime(100);
    stateManager.processTimeBasedStatusEffects(combat, 100);
    expect(hero.health).toBe(97); // 100 - 3 = 97

    // Reapply poison at time 150 (mid-interval)
    mockCurrentTime(150);
    const secondPoison = StatusEffectFactory.createPoisoned(200, 4);
    statusEffectManager.applyStatusEffect(hero, secondPoison);
    
    // Verify stacking: combined damage, extended expiration, but original timing preserved
    expect(hero.statusEffects.length).toBe(1);
    expect(hero.statusEffects[0].damageOverTime).toBe(7); // 3 + 4 = 7
    expect(hero.statusEffects[0].appliedAt).toBe(0); // Original time preserved
    expect(hero.statusEffects[0].expiresAt).toBe(350); // max(200, 150+200) = 350

    // At time 175 - not a global interval, no additional damage
    mockCurrentTime(175);
    const result1 = stateManager.processTimeBasedStatusEffects(combat, 175);
    expect(hero.health).toBe(97); // No change
    expect(result1.statusMessages.filter(msg => msg.includes('poison damage')).length).toBe(0);

    // At time 200 - next global interval, combined poison should tick
    // This is the key improvement: damage at 200, not delayed to 250!
    mockCurrentTime(200);
    const result2 = stateManager.processTimeBasedStatusEffects(combat, 200);
    expect(hero.health).toBe(90); // 97 - 7 = 90 (combined damage)
    expect(result2.statusMessages.filter(msg => msg.includes('poison damage')).length).toBe(1);
    expect(result2.statusMessages[0]).toContain('takes 7 poison damage');

    // At time 300 - another global interval, combined poison should tick again
    mockCurrentTime(300);
    const result3 = stateManager.processTimeBasedStatusEffects(combat, 300);
    expect(hero.health).toBe(83); // 90 - 7 = 83
    expect(result3.statusMessages.filter(msg => msg.includes('poison damage')).length).toBe(1);
  });
});
