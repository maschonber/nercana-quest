import { TestBed } from '@angular/core/testing';
import { StatusEffectManager } from './status-effect-manager.service';
import { TurnManager } from './turn-manager.service';
import { StatusEffectFactory, StatusEffectType } from '../models/status-effect.model';
import { Combatant } from '../models/combat.model';

describe('StatusEffectManager', () => {
  let service: StatusEffectManager;
  let turnManager: TurnManager;
  let mockCombatant: Combatant;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatusEffectManager);
    turnManager = TestBed.inject(TurnManager);
      mockCombatant = {
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
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('time-based status effects', () => {
    it('should apply status effect with current time', () => {
      // Set up turn manager with initial time
      turnManager.initializeTurnQueue([mockCombatant]);
      const initialTime = turnManager.getCurrentTime();
      
      const defendEffect = StatusEffectFactory.createDefending();
      service.applyStatusEffect(mockCombatant, defendEffect);

      expect(mockCombatant.statusEffects).toHaveLength(1);
      expect(mockCombatant.statusEffects[0].appliedAt).toBe(initialTime);
      expect(mockCombatant.statusEffects[0].expiresAt).toBe(initialTime + defendEffect.duration);
    });

    it('should not expire effects that are still active', () => {
      // Set up turn manager
      turnManager.initializeTurnQueue([mockCombatant]);
      
      const defendEffect = StatusEffectFactory.createDefending();
      service.applyStatusEffect(mockCombatant, defendEffect);

      // Process effects before expiration time
      const result = service.processStatusEffects(mockCombatant);

      expect(mockCombatant.statusEffects).toHaveLength(1);
      expect(result.expiredEffects).toHaveLength(0);
    });

    it('should expire effects after their time has passed', () => {
      // Set up turn manager
      turnManager.initializeTurnQueue([mockCombatant]);
      
      const shortEffect = StatusEffectFactory.createDefending(50); // Short duration
      service.applyStatusEffect(mockCombatant, shortEffect);

      // Advance time significantly by simulating actor getting next turn
      turnManager.getNextActor();
      turnManager.getNextActor();
      turnManager.getNextActor();

      // Process effects after expiration time
      const result = service.processStatusEffects(mockCombatant);

      expect(mockCombatant.statusEffects).toHaveLength(0);
      expect(result.expiredEffects).toHaveLength(1);
      expect(result.expiredEffects[0].type).toBe(StatusEffectType.DEFENDING);
    });

    it('should calculate damage reduction correctly', () => {
      const defendEffect = StatusEffectFactory.createDefending();
      service.applyStatusEffect(mockCombatant, defendEffect);

      const damageReduction = service.calculateDamageReduction(mockCombatant);
      expect(damageReduction).toBe(0.4); // 40% damage reduction
    });

    it('should provide status effect description with time remaining', () => {
      turnManager.initializeTurnQueue([mockCombatant]);
      
      const defendEffect = StatusEffectFactory.createDefending();
      service.applyStatusEffect(mockCombatant, defendEffect);

      const description = service.getStatusEffectDescription(mockCombatant);
      expect(description).toContain('Defending');
      expect(description).toMatch(/\(\~\d+ turns\)|ending soon/);
    });

    it('should handle multiple status effects with different expiration times', () => {
      turnManager.initializeTurnQueue([mockCombatant]);
      
      const shortEffect = StatusEffectFactory.createDefending(50);
      const longEffect = StatusEffectFactory.createEmpowered(400);
      
      service.applyStatusEffect(mockCombatant, shortEffect);
      service.applyStatusEffect(mockCombatant, longEffect);

      expect(mockCombatant.statusEffects).toHaveLength(2);

      // Advance time to expire short effect but not long effect
      turnManager.getNextActor();
      turnManager.getNextActor();
      turnManager.getNextActor();

      const result = service.processStatusEffects(mockCombatant);

      expect(mockCombatant.statusEffects).toHaveLength(1);
      expect(mockCombatant.statusEffects[0].type).toBe(StatusEffectType.EMPOWERED);
      expect(result.expiredEffects).toHaveLength(1);
      expect(result.expiredEffects[0].type).toBe(StatusEffectType.DEFENDING);
    });
  });
});
