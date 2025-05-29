import { Injectable } from '@angular/core';
import { Hero } from '../../hero/models/hero.model';
import { Monster } from '../models/monster.model';
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

@Injectable({
  providedIn: 'root'
})
export class CombatOrchestrator {

  constructor(
    private turnManager: TurnManager,
    private combatAI: CombatAI,
    private stateManager: CombatStateManager,
    private actionExecutor: ActionExecutor,
    private entityConverter: EntityConverter
  ) {}

  /**
   * Creates a team combat scenario from individual heroes and monsters
   */
  createTeamCombat(heroes: Hero[], monsters: Monster[]): CombatResult {
    const { heroTeam, enemyTeam } = this.entityConverter.createCombatantTeams(heroes, monsters);
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
    const experienceGained = this.stateManager.calculateExperienceGained(combat.enemyTeam);

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

    // Get all alive combatants from both teams
    const allCombatants = this.stateManager.getAliveCombatants(combat);

    // Initialize turn queue on first turn
    if (combat.turns.length === 0) {
      this.turnManager.initializeTurnQueue(allCombatants);
    }

    // Get the next acting combatant
    const actingCombatant = this.turnManager.getNextActor();
    
    if (!actingCombatant || !actingCombatant.isAlive) {
      // Skip turn if no valid actor
      return;
    }

    // Determine opposing team
    const opposingTeam = actingCombatant.type === 'hero' 
      ? combat.enemyTeam 
      : combat.heroTeam;

    // Select target using AI
    const target = this.combatAI.selectTarget(opposingTeam);
    
    if (!target) {
      // No valid targets, combat should end
      this.stateManager.checkCombatEnd(combat);
      return;
    }

    // Determine action using AI
    const actionType = this.combatAI.determineAction(actingCombatant, opposingTeam);

    // Execute the turn
    const turn = this.actionExecutor.executeTurn(
      combat.currentTurn, 
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
