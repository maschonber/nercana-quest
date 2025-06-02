import { Injectable } from '@angular/core';
import { Hero } from '../../hero/models/hero.model';
import { Monster } from '../../quest/models/monster.model';
import {
  Combat,
  CombatOutcome,
  CombatResult,
  Combatant
} from '../models/combat.model';
import { CombatAI } from './combat-ai.service';
import { TurnManager } from './turn-manager.service';
import { CombatStateManager } from './combat-state-manager.service';
import { ActionExecutor } from './action-executor.service';
import { EntityConverter } from './entity-converter.service';
import { StatusEffectManager } from './status-effect-manager.service';
import { CombatEncounterNarratorService } from './combat-encounter-narrator.service';

@Injectable({
  providedIn: 'root'
})
export class CombatOrchestrator {
  constructor(
    private turnManager: TurnManager,
    private combatAI: CombatAI,
    private stateManager: CombatStateManager,
    private actionExecutor: ActionExecutor,
    private entityConverter: EntityConverter,
    private statusEffectManager: StatusEffectManager,
    private narrator: CombatEncounterNarratorService
  ) {}

  /**
   * Creates a team combat scenario from individual heroes and monsters
   */
  createTeamCombat(heroes: Hero[], monsters: Monster[]): CombatResult {
    const { heroTeam, enemyTeam } = this.entityConverter.createCombatantTeams(
      heroes,
      monsters
    );
    
    // Initialize combat state
    const combat = this.stateManager.createCombatState(heroTeam, enemyTeam);

    // Reset turn manager for new combat
    this.turnManager.reset();

    // Simulate turns until combat ends
    while (combat.outcome === CombatOutcome.IN_PROGRESS) {
      this.executeCombatTurn(combat);
    }

    // Calculate total experience reward from defeated enemies
    const experienceGained = this.stateManager.calculateExperienceGained(
      combat.enemyTeam
    );

    // Create a summary based on the outcome
    const summary = this.stateManager.generateCombatSummary(combat);

    // Generate enhanced narrative for quest logs
    const enhancedNarrative = this.narrator.generateEncounterNarrative(combat);

    // Create the result with enhanced narrative
    const result: CombatResult = {
      outcome: combat.outcome,
      turns: combat.turns,
      experienceGained,
      summary,
      enhancedNarrative
    };

    return result;
  }

  /**
   * Simulates a complete combat encounter between two teams
   */
  simulateCombat(heroTeam: Combatant[], enemyTeam: Combatant[]): CombatResult {
    // Initialize combat state
    const combat = this.stateManager.createCombatState(heroTeam, enemyTeam);

    // Reset turn manager for new combat
    this.turnManager.reset();

    // Simulate turns until combat ends
    while (combat.outcome === CombatOutcome.IN_PROGRESS) {
      this.executeCombatTurn(combat);
    }

    // Calculate total experience reward from defeated enemies
    const experienceGained = this.stateManager.calculateExperienceGained(
      combat.enemyTeam
    );

    // Create a summary based on the outcome
    const summary = this.stateManager.generateCombatSummary(combat);

    // Return the final combat result
    return {
      outcome: combat.outcome,
      turns: combat.turns,
      experienceGained,
      summary
    };
  }

  /**
   * Executes a single combat turn using speed-based initiative
   */
  private executeCombatTurn(combat: Combat): void {
    combat.currentTurn++;

    // Process status effects at the start of each turn (for non-damage effects like expiration)
    this.stateManager.processStatusEffectsForAllCombatants(combat);

    // Get all alive combatants from both teams
    const allCombatants = this.stateManager.getAliveCombatants(combat);

    // Initialize turn queue on first turn
    if (combat.turns.length === 0) {
      this.turnManager.initializeTurnQueue(allCombatants);
    }

    // Get the next acting combatant or status effect turn
    const nextAction = this.turnManager.getNextActor();

    // Handle status effect turn
    if (nextAction.isStatusEffectTurn) {
      const currentTime = this.turnManager.getCurrentTime();
      const statusResult = this.stateManager.processTimeBasedStatusEffects(combat, currentTime);
      
      if (statusResult.shouldCreateTurn) {
        this.createStatusEffectTurn(combat, statusResult.statusMessages, currentTime);
      }
      return;
    }

    const actingCombatant = nextAction.combatant;

    if (!actingCombatant || !actingCombatant.isAlive) {
      // Skip turn if no valid actor
      return;
    }

    // Check if combatant can act (not stunned)
    if (!this.statusEffectManager.canAct(actingCombatant)) {
      // Create a turn entry for the skipped action
      const skipTurn = {
        turnNumber: combat.currentTurn + 1,
        combatTime: this.turnManager.getCurrentTime(),
        actorId: actingCombatant.id,
        action: {
          type: 'skip' as any,
          description: `${actingCombatant.name} is unable to act due to status effects!`,
          actorId: actingCombatant.id,
          actorName: actingCombatant.name,
          targetId: actingCombatant.id,
          targetName: actingCombatant.name,
          success: false
        },
        actorHealthAfter: actingCombatant.health,
        targetHealthAfter: actingCombatant.health,
        allCombatantsHealth: this.stateManager.captureAllCombatantsHealth(combat),
        heroHealthAfter: actingCombatant.type === 'hero' ? actingCombatant.health : 0,
        monsterHealthAfter: actingCombatant.type === 'monster' ? actingCombatant.health : 0
      };
      combat.turns.push(skipTurn);
      return;
    }

    // Determine opposing team
    const opposingTeam =
      actingCombatant.type === 'hero' ? combat.enemyTeam : combat.heroTeam;

    // Select target using AI
    const target = this.combatAI.selectTarget(opposingTeam);

    if (!target) {
      // No valid targets, combat should end
      this.stateManager.checkCombatEnd(combat);
      return;
    }

    // Determine action using AI
    const actionType = this.combatAI.determineAction(
      actingCombatant,
      combat
    );

    // Execute the turn
    const turn = this.actionExecutor.executeTurn(
      combat.currentTurn + 1,
      actingCombatant,
      target,
      actionType,
      combat
    );
    combat.turns.push(turn);

    // Update combatant states
    this.stateManager.updateCombatantStates(combat);

    // Check if combat has ended
    this.stateManager.checkCombatEnd(combat);
  }

  /**
   * Create a special turn for status effect damage/healing
   */
  private createStatusEffectTurn(combat: Combat, statusMessages: string[], combatTime: number): void {
    if (statusMessages.length === 0) return;

    const statusEffectTurn = {
      turnNumber: combat.currentTurn + 1,
      combatTime: combatTime,
      actorId: 'status-effects',
      action: {
        type: 'special' as any,
        description: statusMessages.join(' '),
        actorId: 'status-effects',
        actorName: 'Status Effects',
        targetId: 'all',
        targetName: 'All Combatants',
        success: true
      },
      actorHealthAfter: 0, // Not applicable for status effects
      targetHealthAfter: 0, // Not applicable for status effects
      allCombatantsHealth: this.stateManager.captureAllCombatantsHealth(combat),
      heroHealthAfter: 0, // Legacy field
      monsterHealthAfter: 0 // Legacy field
    };

    combat.turns.push(statusEffectTurn);

    // Update combatant states after status effect processing
    this.stateManager.updateCombatantStates(combat);

    // Check if combat has ended due to status effect damage
    this.stateManager.checkCombatEnd(combat);
  }
}
