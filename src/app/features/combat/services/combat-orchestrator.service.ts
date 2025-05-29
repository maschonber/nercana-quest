import { Injectable } from '@angular/core';
import { Hero } from '../../hero/models/hero.model';
import { Monster } from '../../quest/models/monster.model';
import {
  Combatant,
  CombatResult,
  CombatOutcome,
  Combat
} from '../models/combat.model';
import { TurnManager } from './turn-manager.service';
import { CombatAI } from './combat-ai.service';
import { CombatStateManager } from './combat-state-manager.service';
import { ActionExecutor } from './action-executor.service';
import { EntityConverter } from './entity-converter.service';
import { StatusEffectManager } from './status-effect-manager.service';

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
    private statusEffectManager: StatusEffectManager
  ) {}

  /**
   * Creates a team combat scenario from individual heroes and monsters
   */
  createTeamCombat(heroes: Hero[], monsters: Monster[]): CombatResult {
    const { heroTeam, enemyTeam } = this.entityConverter.createCombatantTeams(
      heroes,
      monsters
    );
    return this.simulateCombat(heroTeam, enemyTeam);
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

    // Process status effects at the start of each turn
    const statusMessages = this.stateManager.processStatusEffectsForAllCombatants(combat);
    
    // Add status effect messages to combat log if any
    if (statusMessages.length > 0) {
      // Create a pseudo-turn for status effects
      const statusTurn = {
        turnNumber: combat.currentTurn,
        combatTime: this.turnManager.getCurrentTime(),
        actorId: 'system',
        action: {
          type: 'system' as any,
          description: statusMessages.join(' '),
          actorId: 'system',
          actorName: 'System',
          targetId: 'all',
          targetName: 'All',
          success: true
        },
        actorHealthAfter: 0,
        targetHealthAfter: 0,
        allCombatantsHealth: this.stateManager.captureAllCombatantsHealth(combat),
        heroHealthAfter: 0,
        monsterHealthAfter: 0
      };
      combat.turns.push(statusTurn);
    }

    // Get all alive combatants from both teams
    const allCombatants = this.stateManager.getAliveCombatants(combat);

    // Initialize turn queue on first turn
    if (combat.turns.length === 0 || (combat.turns.length === 1 && statusMessages.length > 0)) {
      this.turnManager.initializeTurnQueue(allCombatants);
    }

    // Get the next acting combatant
    const actingCombatant = this.turnManager.getNextActor();

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
      opposingTeam
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
}
