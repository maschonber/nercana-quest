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
  CombatantType
} from '../models/combat.model';

@Injectable({
  providedIn: 'root'
})
export class CombatService {  /**
   * Simulates a complete combat encounter between hero and monster
   * @param hero The hero participating in combat
   * @param monster The monster to fight
   * @returns Complete combat result with turns and outcome
   */
  simulateCombat(hero: Hero, monster: Monster): CombatResult {
    // Initialize combat
    const combat: Combat = {
      hero,
      monster: { ...monster }, // Clone monster to avoid modifying original
      turns: [],
      currentTurn: 0,
      outcome: CombatOutcome.IN_PROGRESS
    };

    // Simulate turns until combat ends (victory, defeat, or flee)
    while (combat.outcome === CombatOutcome.IN_PROGRESS) {
      this.executeCombatTurn(combat);
    }

    // Create a summary based on the outcome
    const summary = this.generateCombatSummary(combat);    // Return the final combat result
    return {
      outcome: combat.outcome,
      turns: combat.turns,
      experienceGained: combat.outcome === CombatOutcome.HERO_VICTORY ? monster.experienceReward : Math.floor(monster.experienceReward * 0.2),
      summary
    };
  }  /**
   * Executes a single combat turn
   */
  private executeCombatTurn(combat: Combat): void {
    const { hero, monster } = combat;
    combat.currentTurn++;

    // Convert hero and monster to combatants for shared logic
    const heroCombatant = this.toCombatant(hero, CombatantType.HERO);
    const monsterCombatant = this.toCombatant(monster, CombatantType.MONSTER);

    // Determine which combatant acts this turn based on initiative/speed
    // We alternate turns, but the first actor is determined by speed
    const isFirstTurn = combat.turns.length === 0;
    
    let actorType: CombatantType;
    
    if (isFirstTurn) {
      // For the first turn, determine who goes first based on speed
      actorType = this.determineFirstActor(heroCombatant, monsterCombatant, hero, monster);
    } else {
      // For subsequent turns, alternate between hero and monster
      const lastTurn = combat.turns[combat.turns.length - 1];
      actorType = lastTurn.actor === CombatantType.HERO ? CombatantType.MONSTER : CombatantType.HERO;
    }

    // Execute the appropriate turn based on actor type
    let turn: CombatTurn;
    
    if (actorType === CombatantType.HERO) {
      turn = this.executeHeroTurn(combat.currentTurn, hero, monster);
      
      // Update health after turn
      monster.health = turn.targetHealthAfter;
      
      // Check for flee attempt
      if (turn.action.type === CombatActionType.FLEE && turn.action.success) {
        combat.outcome = CombatOutcome.HERO_FLED;
      }
    } else {
      turn = this.executeMonsterTurn(combat.currentTurn, monster, hero);
      
      // Update health after turn
      hero.health = turn.targetHealthAfter;
    }

    // Add the current turn to the combat's turns
    combat.turns.push(turn);
    
    // Check if combat has ended
    if (monster.health <= 0) {
      combat.outcome = CombatOutcome.HERO_VICTORY;
    } else if (hero.health <= 0) {
      combat.outcome = CombatOutcome.HERO_DEFEAT;
    }
  }

  /**
   * Determines which actor goes first in combat
   */
  private determineFirstActor(heroCombatant: Combatant, monsterCombatant: Combatant, hero: Hero, monster: Monster): CombatantType {
    // For now, use attack stat + luck as speed/initiative. 
    // Later can be expanded to include dedicated speed/agility stats
    const heroSpeed = hero.attack + (hero.luck / 2);
    const monsterSpeed = monster.attack;

    if (heroSpeed >= monsterSpeed) {
      return CombatantType.HERO;
    } else {
      return CombatantType.MONSTER;
    }
  }
  /**
   * Execute a hero's turn
   */
  private executeHeroTurn(turnNumber: number, hero: Hero, monster: Monster): CombatTurn {
    const action = this.determineHeroAction(hero, monster);
    const initialMonsterHealth = monster.health;

    // Execute the action using shared logic
    this.executeAction(action, hero, monster);

    return {
      turnNumber,
      actor: CombatantType.HERO,
      action,
      actorHealthAfter: hero.health,
      targetHealthAfter: monster.health,
      heroHealthAfter: hero.health,
      monsterHealthAfter: monster.health
    };
  }

  /**
   * Execute a monster's turn
   */
  private executeMonsterTurn(turnNumber: number, monster: Monster, hero: Hero): CombatTurn {
    const action = this.determineMonsterAction(monster, hero);
    const initialHeroHealth = hero.health;

    // Execute the action using shared logic
    this.executeAction(action, monster, hero);

    return {
      turnNumber,
      actor: CombatantType.MONSTER,
      action,
      actorHealthAfter: monster.health,
      targetHealthAfter: hero.health,
      heroHealthAfter: hero.health,
      monsterHealthAfter: monster.health
    };
  }
  /**
   * Shared action execution logic for both heroes and monsters
   */
  private executeAction(action: CombatAction, actor: Hero | Monster, target: Hero | Monster): void {
    switch (action.type) {
      case CombatActionType.ATTACK:
        const damage = this.calculateDamage(actor.attack, target.defense);
        target.health = Math.max(0, target.health - damage);
        action.damage = damage;
        action.success = damage > 0;
        break;
        
      case CombatActionType.DEFEND:
        // Defense is handled in damage calculation when target is defending
        action.success = true;
        break;
        
      case CombatActionType.SPECIAL:
        // Special attacks deal more damage but have lower success chance
        if (Math.random() < 0.6) { // 60% success rate
          const specialDamage = this.calculateDamage(actor.attack * 1.5, target.defense);
          target.health = Math.max(0, target.health - specialDamage);
          action.damage = specialDamage;
          action.success = true;
        } else {
          action.success = false;
        }
        break;
        
      case CombatActionType.FLEE:
        // Only heroes can flee - this should be handled in the hero turn method
        if ('luck' in actor) { // Check if it's a hero
          const fleeChance = 0.3 + ((actor as Hero).luck / 50);
          action.success = Math.random() < fleeChance;
        } else {
          action.success = false;
        }
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
   * Determine what action the hero will take
   */
  private determineHeroAction(hero: Hero, monster: Monster): CombatAction {
    // Base probabilities for actions
    let attackProb = 0.7;    // 70% chance to attack
    let defendProb = 0.15;   // 15% chance to defend
    let specialProb = 0.1;   // 10% chance for special attack
    let fleeProb = 0.05;     // 5% chance to attempt to flee
    
    // Adjust probabilities based on situation
    
    // If hero is low on health, increase chance to defend or flee
    if (hero.health < 30) {
      attackProb -= 0.2;
      defendProb += 0.1;
      fleeProb += 0.1;
    }
    
    // If monster is nearly defeated, increase attack probability
    if (monster.health < monster.maxHealth * 0.2) {
      attackProb += 0.1;
      fleeProb -= 0.05;
      specialProb -= 0.05;
    }
    
    // For testing: If hero is much stronger than the monster, never flee
    const heroStrengthRatio = hero.attack / monster.defense;
    if (heroStrengthRatio > 5 && hero.health > 50) {
      // Hero is very strong compared to monster, remove flee probability
      if (fleeProb > 0) {
        attackProb += fleeProb;
        fleeProb = 0;
      }
    }
    
    // Select action based on probabilities
    const roll = Math.random();
    let actionType: CombatActionType;
    let description: string;
      if (roll < attackProb) {
      actionType = CombatActionType.ATTACK;
      description = `${hero.name} fires at ${monster.name}!`;
    } else if (roll < attackProb + defendProb) {
      actionType = CombatActionType.DEFEND;
      description = `${hero.name} activates defensive systems.`;
    } else if (roll < attackProb + defendProb + specialProb) {
      actionType = CombatActionType.SPECIAL;
      description = `${hero.name} attempts a charged energy blast against ${monster.name}!`;
    } else {
      actionType = CombatActionType.FLEE;
      description = `${hero.name} attempts to disengage from combat!`;
    }
    
    return {
      type: actionType,
      description,
      actorName: hero.name,
      targetName: monster.name,
      success: false // Will be updated during execution
    };
  }

  /**
   * Determine what action the monster will take
   */
  private determineMonsterAction(monster: Monster, hero: Hero): CombatAction {
    // Monsters mostly attack, with occasional defensive moves
    const attackProb = 0.8; // 80% chance to attack
    
    let actionType: CombatActionType;
    let description: string;
      if (Math.random() < attackProb) {
      actionType = CombatActionType.ATTACK;
      description = `${monster.name} strikes at ${hero.name}!`;
    } else {
      actionType = CombatActionType.DEFEND;
      description = `${monster.name} prepares defensive maneuvers.`;
    }
    
    return {
      type: actionType,
      description,
      actorName: monster.name,
      targetName: hero.name,
      success: false // Will be updated during execution
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
  }
  /**
   * Generate a narrative summary of the combat encounter
   */
  private generateCombatSummary(combat: Combat): string {
    const { hero, monster, outcome, turns } = combat;
    
    switch (outcome) {
      case CombatOutcome.HERO_VICTORY:
        return `After ${turns.length} turns, ${hero.name} emerged victorious against the ${monster.name}!`;
        
      case CombatOutcome.HERO_DEFEAT:
        return `After ${turns.length} turns, ${hero.name} was defeated by the ${monster.name}!`;
        
      case CombatOutcome.HERO_FLED:
        return `After ${turns.length} turns of combat, ${hero.name} managed to escape from the ${monster.name}.`;
        
      default:
        return `The battle between ${hero.name} and ${monster.name} continues...`;
    }
  }

  /**
   * Convert hero or monster to combatant interface
   */
  private toCombatant(entity: Hero | Monster, type: CombatantType): Combatant {
    return {
      name: entity.name,
      health: entity.health,
      maxHealth: type === CombatantType.HERO ? 100 : (entity as Monster).maxHealth, // Heroes have fixed max health
      attack: entity.attack,
      defense: entity.defense,
      type
    };
  }
}
