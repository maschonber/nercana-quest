import { Injectable } from '@angular/core';
import { Hero } from '../../hero/models/hero.model';
import { Monster } from '../models/monster.model';
import { 
  Combat, 
  CombatAction, 
  CombatActionType, 
  CombatOutcome,
  CombatResult,
  CombatTurn,
  Combatant,
  CombatantType,
  CombatTeam,
  TeamSide,
  CombatantHealthState
} from '../models/combat.model';

interface TurnQueueEntry {
  combatant: Combatant;
  nextActionTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class CombatService {
  private turnQueue: TurnQueueEntry[] = [];
  private currentTime: number = 0;  /**
   * Simulates a complete combat encounter between two teams
   * @param heroTeam Array of combatants fighting for the hero side
   * @param enemyTeam Array of combatants fighting for the enemy side
   * @returns Complete combat result with turns and outcome
   */
  simulateCombat(heroTeam: Combatant[], enemyTeam: Combatant[]): CombatResult {
    // Initialize combat with teams
    const combat: Combat = {
      heroTeam: { side: TeamSide.HERO, combatants: [...heroTeam] },
      enemyTeam: { side: TeamSide.ENEMY, combatants: [...enemyTeam] },
      turns: [],
      currentTurn: 0,
      outcome: CombatOutcome.IN_PROGRESS
    };

    // Simulate turns until combat ends
    while (combat.outcome === CombatOutcome.IN_PROGRESS) {
      this.executeCombatTurn(combat);
    }

    // Calculate total experience reward from defeated enemies
    const experienceGained = this.calculateExperienceGained(combat.enemyTeam);

    // Create a summary based on the outcome
    const summary = this.generateCombatSummary(combat);

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
    const allCombatants = [
      ...combat.heroTeam.combatants.filter(c => c.isAlive),
      ...combat.enemyTeam.combatants.filter(c => c.isAlive)
    ];

    // Initialize turn queue on first turn
    if (combat.turns.length === 0) {
      this.initializeTurnQueue(allCombatants);
    }

    // Get the next acting combatant
    const actingCombatant = this.getNextActor();
    
    if (!actingCombatant || !actingCombatant.isAlive) {
      // Skip turn if no valid actor
      return;
    }

    // Determine opposing team
    const opposingTeam = actingCombatant.type === CombatantType.HERO 
      ? combat.enemyTeam 
      : combat.heroTeam;

    // Select target using smart AI
    const target = this.selectTarget(opposingTeam);
    
    if (!target) {
      // No valid targets, combat should end
      this.checkCombatEnd(combat);
      return;
    }    // Execute the turn
    const turn = this.executeTurn(combat.currentTurn, actingCombatant, target, combat);
    combat.turns.push(turn);

    // Update combatant states
    this.updateCombatantStates(combat);

    // Check if combat has ended
    this.checkCombatEnd(combat);
  }
  /**
   * Initializes the turn queue with all combatants based on their speed
   */
  private initializeTurnQueue(combatants: Combatant[]): void {
    this.turnQueue = [];
    this.currentTime = 0;
    
    combatants.forEach(combatant => {
      // Calculate initial action delay based on speed (lower delay = faster action)
      // Base delay is 100, reduced by speed. Minimum delay is 10.
      const actionDelay = Math.max(10, 100 - combatant.speed * 3);
      
      this.turnQueue.push({
        combatant,
        nextActionTime: actionDelay
      });
    });
    
    // Sort by next action time (soonest first)
    this.turnQueue.sort((a, b) => a.nextActionTime - b.nextActionTime);
  }

  /**
   * Gets the next actor based on speed and scheduling
   */
  private getNextActor(): Combatant | null {
    // Filter out dead/fled combatants from queue
    this.turnQueue = this.turnQueue.filter(entry => 
      entry.combatant.isAlive && !entry.combatant.hasFled
    );
    
    if (this.turnQueue.length === 0) {
      return null;
    }
    
    // Find the combatant with the earliest next action time
    const nextEntry = this.turnQueue[0];
    const actingCombatant = nextEntry.combatant;
    
    // Advance time to when this combatant acts
    this.currentTime = nextEntry.nextActionTime;
    
    // Schedule this combatant's next action
    // Action delay is based on speed: faster combatants act more frequently
    const actionDelay = Math.max(10, 100 - actingCombatant.speed * 3);
    nextEntry.nextActionTime = this.currentTime + actionDelay;
      // Resort the queue for next turn
    this.turnQueue.sort((a, b) => a.nextActionTime - b.nextActionTime);
    
    return actingCombatant;
  }

  /**
   * Shared action execution logic for combatants
   */
  private executeAction(action: CombatAction, actor: Combatant, target: Combatant): void {
    switch (action.type) {
      case CombatActionType.ATTACK:
        const damage = this.calculateDamage(actor.attack, target.defense);
        target.health = Math.max(0, target.health - damage);
        action.damage = damage;
        action.success = damage > 0;
        break;
        
      case CombatActionType.FLEE:
        if (action.success) {
          actor.hasFled = true;
          action.description += ' Success!';
        } else {
          action.description += ' Failed!';
        }
        break;
        
      case CombatActionType.DEFEND:
        // Defending reduces incoming damage on next attack (not implemented yet)
        action.success = true;
        break;
        
      case CombatActionType.SPECIAL:
        // Special abilities (not implemented yet)
        action.success = false;
        break;
    }
  }

  /**
   * Enhanced damage calculation that considers defensive actions
   */
  private calculateDamageWithDefense(attack: number, defense: number, targetDefending: boolean): number {
    let effectiveDefense = defense;
    
    // If target is defending, increase their defense
    if (targetDefending) {
      effectiveDefense *= 1.5;
    }
    
    return this.calculateDamage(attack, effectiveDefense);
  }
  /**
   * Determines what action a combatant should take
   */
  private determineAction(actor: Combatant, target: Combatant): CombatAction {
    // For now, use simple logic based on combatant type
    if (actor.type === CombatantType.HERO) {
      return this.determineHeroAction(actor, target);
    } else {
      return this.determineMonsterAction(actor, target);
    }
  }

  /**
   * Determines hero action (updated for combatant interface)
   */
  private determineHeroAction(hero: Combatant, target: Combatant): CombatAction {
    // Hero logic: 10% chance to flee if health is very low
    if (hero.health <= hero.maxHealth * 0.2 && Math.random() < 0.1) {
      return {
        type: CombatActionType.FLEE,
        description: `${hero.name} attempts to flee from combat!`,
        actorId: hero.id,
        actorName: hero.name,
        targetId: target.id,
        targetName: target.name,
        success: Math.random() < 0.7 // 70% chance to flee successfully
      };
    }

    // Otherwise, attack
    return {
      type: CombatActionType.ATTACK,
      description: `${hero.name} attacks ${target.name}!`,
      actorId: hero.id,
      actorName: hero.name,
      targetId: target.id,
      targetName: target.name,
      success: true
    };
  }

  /**
   * Determines monster action (updated for combatant interface)
   */
  private determineMonsterAction(monster: Combatant, target: Combatant): CombatAction {
    // Monster logic: Always attack (monsters don't flee)
    return {
      type: CombatActionType.ATTACK,
      description: `${monster.name} attacks ${target.name}!`,
      actorId: monster.id,
      actorName: monster.name,
      targetId: target.id,
      targetName: target.name,
      success: true
    };
  }
  /**
   * Calculate damage based on attacker's attack and defender's defense
   */
  private calculateDamage(attack: number, defense: number): number {
    // Base damage calculation
    let baseDamage = attack - (defense * 0.5);
    
    // Ensure minimum damage
    baseDamage = Math.max(1, baseDamage);
    
    // Add randomness (80-120% of base damage)
    const variance = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
    
    // Critical hit chance (10% chance for 1.5x damage)
    const criticalMultiplier = Math.random() < 0.1 ? 1.5 : 1.0;
    
    // Calculate final damage
    const finalDamage = Math.floor(baseDamage * variance * criticalMultiplier);
    
    return finalDamage;
  }  /**
   * Generate a narrative summary of the combat encounter
   */
  private generateCombatSummary(combat: Combat): string {
    const { outcome, turns, heroTeam, enemyTeam } = combat;
    
    const heroNames = heroTeam.combatants.map(c => c.name).join(', ');
    const enemyNames = enemyTeam.combatants.map(c => c.name).join(', ');
    
    switch (outcome) {
      case CombatOutcome.HERO_VICTORY:
        return `After ${turns.length} turns, the hero team (${heroNames}) emerged victorious against the enemy team (${enemyNames})!`;
        
      case CombatOutcome.HERO_DEFEAT:
        return `After ${turns.length} turns, the hero team (${heroNames}) was defeated by the enemy team (${enemyNames})!`;
        
      case CombatOutcome.HERO_FLED:
        return `After ${turns.length} turns of combat, the hero team (${heroNames}) managed to escape from the enemy team (${enemyNames}).`;
        
      default:
        return `The battle between the hero team (${heroNames}) and the enemy team (${enemyNames}) continues...`;
    }
  }
  /**
   * Enhanced AI target selection with realistic tactical decisions
   * 
   * Priority system:
   * 1. Healers/Support units (if identified by low attack, high speed)
   * 2. Low health enemies that can be finished quickly (< 30% health)
   * 3. High damage dealers (high attack) to reduce incoming damage
   * 4. Tanks/Defensive units (high defense) when no better options exist
   * 
   * This creates more realistic combat where AI focuses on:
   * - Eliminating threats efficiently
   * - Finishing wounded enemies
   * - Prioritizing dangerous opponents
   */
  private selectTarget(opposingTeam: CombatTeam): Combatant | null {
    const availableTargets = opposingTeam.combatants.filter(c => c.isAlive && !c.hasFled);
    
    if (availableTargets.length === 0) {
      return null;
    }

    // If only one target, return it immediately
    if (availableTargets.length === 1) {
      return availableTargets[0];
    }

    // Calculate threat scores for each target
    const targetScores = availableTargets.map(target => {
      const healthPercent = (target.health / target.maxHealth) * 100;
      let score = 0;
      let reason = '';

      // Priority 1: Identify potential healers/support (low attack, high speed)
      // These are dangerous because they can heal or buff others
      if (target.attack < 15 && target.speed > 20) {
        score += 100;
        reason = 'suspected healer/support';
      }

      // Priority 2: Finish off weak enemies (< 30% health)
      // This reduces enemy action economy quickly
      if (healthPercent < 30) {
        score += 80 + (30 - healthPercent); // Weaker = higher priority
        reason = reason ? `${reason}, critically wounded` : 'critically wounded';
      }

      // Priority 3: High damage dealers (attack > 25)
      // These pose the greatest immediate threat
      if (target.attack > 25) {
        score += 60 + (target.attack - 25);
        reason = reason ? `${reason}, high damage dealer` : 'high damage dealer';
      }

      // Priority 4: Medium health enemies that can be finished with focus fire
      // Between 30-60% health are good secondary targets
      if (healthPercent >= 30 && healthPercent <= 60) {
        score += 40 + (60 - healthPercent);
        reason = reason ? `${reason}, moderately wounded` : 'moderately wounded';
      }

      // Bonus: Speed consideration - fast enemies can act more often
      if (target.speed > 25) {
        score += 15;
        reason = reason ? `${reason}, high speed` : 'high speed';
      }

      // Penalty: High defense enemies are harder to kill (target last)
      if (target.defense > 20) {
        score -= 20;
        reason = reason ? `${reason}, heavily armored` : 'heavily armored';
      }

      // Randomization factor (±10%) to prevent completely predictable behavior
      const randomFactor = 0.9 + (Math.random() * 0.2); // 0.9 to 1.1
      score *= randomFactor;

      return {
        target,
        score,
        reason: reason || 'default target',
        healthPercent
      };
    });

    // Sort by score (highest first) and return the best target
    targetScores.sort((a, b) => b.score - a.score);
    
    // For debugging/logging purposes, you could log the selection reasoning:
    // console.log(`AI selected ${targetScores[0].target.name} (${targetScores[0].reason}, score: ${targetScores[0].score.toFixed(1)})`);
    
    return targetScores[0].target;
  }

  /**
   * Executes a turn between an actor and target
   */  private executeTurn(turnNumber: number, actor: Combatant, target: Combatant, combat: Combat): CombatTurn {
    const action = this.determineAction(actor, target);
    const initialTargetHealth = target.health;

    // Execute the action
    this.executeAction(action, actor, target);

    // Capture comprehensive health states after this turn
    const allCombatantsHealth = this.captureAllCombatantsHealth(combat);

    return {
      turnNumber,
      actorId: actor.id,
      action,
      actorHealthAfter: actor.health,
      targetHealthAfter: target.health,
      allCombatantsHealth,
      // Legacy fields for backward compatibility
      heroHealthAfter: actor.type === CombatantType.HERO ? actor.health : target.health,
      monsterHealthAfter: actor.type === CombatantType.MONSTER ? actor.health : target.health
    };
  }

  /**
   * Captures health states of all combatants at a given moment
   */
  private captureAllCombatantsHealth(combat: Combat): CombatantHealthState[] {
    const allCombatants = [
      ...combat.heroTeam.combatants,
      ...combat.enemyTeam.combatants
    ];

    return allCombatants.map(combatant => ({
      id: combatant.id,
      name: combatant.name,
      health: combatant.health,
      maxHealth: combatant.maxHealth,
      isAlive: combatant.isAlive,
      type: combatant.type
    }));
  }

  /**
   * Updates combatant states (alive/dead) based on current health
   */
  private updateCombatantStates(combat: Combat): void {
    const allCombatants = [
      ...combat.heroTeam.combatants,
      ...combat.enemyTeam.combatants
    ];

    allCombatants.forEach(combatant => {
      combatant.isAlive = combatant.health > 0 && !combatant.hasFled;
    });
  }

  /**
   * Checks if combat should end and updates the outcome
   */
  private checkCombatEnd(combat: Combat): void {
    const aliveHeroes = combat.heroTeam.combatants.filter(c => c.isAlive);
    const aliveEnemies = combat.enemyTeam.combatants.filter(c => c.isAlive);
    const fledHeroes = combat.heroTeam.combatants.filter(c => c.hasFled);

    if (aliveEnemies.length === 0) {
      combat.outcome = CombatOutcome.HERO_VICTORY;
    } else if (aliveHeroes.length === 0) {
      combat.outcome = CombatOutcome.HERO_DEFEAT;
    } else if (fledHeroes.length > 0 && aliveHeroes.length === 0) {
      combat.outcome = CombatOutcome.HERO_FLED;
    }
  }

  /**
   * Calculates total experience gained from defeated enemies
   */
  private calculateExperienceGained(enemyTeam: CombatTeam): number {
    return enemyTeam.combatants
      .filter(enemy => !enemy.isAlive && !enemy.hasFled)
      .reduce((total, enemy) => {
        // Assume experience is based on enemy level/power
        // For now, use a simple formula based on stats
        const enemyPower = enemy.attack + enemy.defense + enemy.speed;
        return total + Math.floor(enemyPower * 2);
      }, 0);
  }
  /**
   * Convert hero or monster to combatant interface
   */
  private toCombatant(entity: Hero | Monster, type: CombatantType, id: string): Combatant {
    return {
      id,
      name: entity.name,
      health: entity.health,
      maxHealth: type === CombatantType.HERO ? 100 : (entity as Monster).maxHealth, // Heroes have fixed max health
      attack: entity.attack,
      defense: entity.defense,
      speed: entity.speed,
      type,
      isAlive: entity.health > 0,
      hasFled: false
    };
  }

  /**
   * Creates a combatant from a hero entity
   */
  createHeroCombatant(hero: Hero, id?: string): Combatant {
    return this.toCombatant(hero, CombatantType.HERO, id || `hero-${hero.name}`);
  }

  /**
   * Creates a combatant from a monster entity
   */
  createMonsterCombatant(monster: Monster, id?: string): Combatant {
    return this.toCombatant(monster, CombatantType.MONSTER, id || `monster-${monster.name}`);
  }

  /**
   * Creates a team combat scenario from individual heroes and monsters
   * This replaces the old createSingleCombat method with a more flexible approach
   */
  createTeamCombat(heroes: Hero[], monsters: Monster[]): CombatResult {
    const heroTeam = heroes.map((hero, index) => 
      this.createHeroCombatant(hero, `hero-${index}-${hero.name}`)
    );
    
    const enemyTeam = monsters.map((monster, index) => 
      this.createMonsterCombatant(monster, `monster-${index}-${monster.name}`)
    );
    
    return this.simulateCombat(heroTeam, enemyTeam);
  }
}
