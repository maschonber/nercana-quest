import { Injectable } from '@angular/core';
import { Hero } from '../../hero/models/hero.model';
import { Monster } from '../models/monster.model';
import { 
  Combat, 
  CombatAction, 
  CombatActionType, 
  CombatOutcome,
  CombatResult,
  CombatRound
} from '../models/combat.model';

@Injectable({
  providedIn: 'root'
})
export class CombatService {
  /**
   * Simulates a complete combat encounter between hero and monster
   * @param hero The hero participating in combat
   * @param monster The monster to fight
   * @returns Complete combat result with rounds and outcome
   */
  simulateCombat(hero: Hero, monster: Monster): CombatResult {
    // Initialize combat
    const combat: Combat = {
      hero,
      monster: { ...monster }, // Clone monster to avoid modifying original
      rounds: [],
      currentRound: 0,
      outcome: CombatOutcome.IN_PROGRESS
    };

    // Simulate rounds until combat ends (victory, defeat, or flee)
    while (combat.outcome === CombatOutcome.IN_PROGRESS) {
      this.simulateCombatRound(combat);
    }

    // Create a summary based on the outcome
    const summary = this.generateCombatSummary(combat);

    // Return the final combat result
    return {
      outcome: combat.outcome,
      rounds: combat.rounds,
      experienceGained: combat.outcome === CombatOutcome.HERO_VICTORY ? monster.experienceReward : Math.floor(monster.experienceReward * 0.2),
      goldGained: combat.outcome === CombatOutcome.HERO_VICTORY ? monster.goldReward : 0,
      summary
    };
  }

  /**
   * Simulates a single round of combat
   */
  private simulateCombatRound(combat: Combat): void {
    const { hero, monster } = combat;
    combat.currentRound++;

    // Determine hero action (mostly attack, with chance of defend/special/flee)
    const heroAction = this.determineHeroAction(hero, monster);
    
    // Determine monster action (mostly attack, with chance of defend)
    const monsterAction = this.determineMonsterAction(monster, hero);
    
    // Execute hero action
    let heroDamageDealt = 0;
    let heroHealing = 0;
    
    if (heroAction.type === CombatActionType.ATTACK) {
      heroDamageDealt = this.calculateDamage(hero.attack, monster.defense);
      monster.health = Math.max(0, monster.health - heroDamageDealt);
      heroAction.damage = heroDamageDealt;
      heroAction.success = heroDamageDealt > 0;
    } else if (heroAction.type === CombatActionType.DEFEND) {
      // Defense increases for this round, handled in monster action
      heroAction.success = true;
    } else if (heroAction.type === CombatActionType.SPECIAL) {
      // Special attacks deal more damage but have lower success chance
      if (Math.random() < 0.6) { // 60% success rate
        heroDamageDealt = this.calculateDamage(hero.attack * 1.5, monster.defense);
        monster.health = Math.max(0, monster.health - heroDamageDealt);
        heroAction.damage = heroDamageDealt;
        heroAction.success = true;
      } else {
        heroAction.success = false;
      }
    } else if (heroAction.type === CombatActionType.FLEE) {
      // Chance to flee based on luck
      const fleeChance = 0.3 + (hero.luck / 50); // 30% base + luck bonus
      heroAction.success = Math.random() < fleeChance;
      
      if (heroAction.success) {
        combat.outcome = CombatOutcome.HERO_FLED;
      }
    }
    
    // Execute monster action if hero didn't flee successfully
    let monsterDamageDealt = 0;
    
    if (combat.outcome === CombatOutcome.IN_PROGRESS) {
      if (monsterAction.type === CombatActionType.ATTACK) {
        // If hero is defending, reduce damage
        const defenseBonus = heroAction.type === CombatActionType.DEFEND ? 0.5 : 0;
        const effectiveDefense = hero.defense * (1 + defenseBonus);
        
        monsterDamageDealt = this.calculateDamage(monster.attack, effectiveDefense);
        monsterAction.damage = monsterDamageDealt;
        monsterAction.success = monsterDamageDealt > 0;
      } else if (monsterAction.type === CombatActionType.DEFEND) {
        // Monster defense handled similarly to hero defense
        monsterAction.success = true;
      }
    }
    
    // Update hero health if monster dealt damage
    if (monsterDamageDealt > 0) {
      hero.health = Math.max(0, hero.health - monsterDamageDealt);
    }
    
    // Create combat round record
    const round: CombatRound = {
      roundNumber: combat.currentRound,
      heroAction,
      monsterAction,
      heroHealthAfter: hero.health,
      monsterHealthAfter: monster.health
    };
    
    combat.rounds.push(round);
    
    // Check if combat has ended
    if (monster.health <= 0) {
      combat.outcome = CombatOutcome.HERO_VICTORY;
    } else if (hero.health <= 0) {
      combat.outcome = CombatOutcome.HERO_DEFEAT;
    }
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
    
    // Select action based on probabilities
    const roll = Math.random();
    let actionType: CombatActionType;
    let description: string;
    
    if (roll < attackProb) {
      actionType = CombatActionType.ATTACK;
      description = `${hero.name} attacks ${monster.name}!`;
    } else if (roll < attackProb + defendProb) {
      actionType = CombatActionType.DEFEND;
      description = `${hero.name} takes a defensive stance.`;
    } else if (roll < attackProb + defendProb + specialProb) {
      actionType = CombatActionType.SPECIAL;
      description = `${hero.name} attempts a powerful strike against ${monster.name}!`;
    } else {
      actionType = CombatActionType.FLEE;
      description = `${hero.name} attempts to flee from the battle!`;
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
      description = `${monster.name} attacks ${hero.name}!`;
    } else {
      actionType = CombatActionType.DEFEND;
      description = `${monster.name} takes a defensive stance.`;
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
    const { hero, monster, outcome, rounds } = combat;
    
    switch (outcome) {
      case CombatOutcome.HERO_VICTORY:
        return `After a ${rounds.length}-round battle, ${hero.name} emerged victorious against the ${monster.name}!`;
        
      case CombatOutcome.HERO_DEFEAT:
        return `After a ${rounds.length}-round battle, ${hero.name} was defeated by the ${monster.name}!`;
        
      case CombatOutcome.HERO_FLED:
        return `After ${rounds.length} rounds of combat, ${hero.name} managed to escape from the ${monster.name}.`;
        
      default:
        return `The battle between ${hero.name} and ${monster.name} continues...`;
    }
  }
}
