import { Injectable } from '@angular/core';
import { 
  Combatant, 
  CombatTeam, 
  CombatOutcome, 
  Combat,
  CombatantHealthState,
  TeamSide
} from '../models/combat.model';

@Injectable({
  providedIn: 'root'
})
export class CombatStateManager {

  /**
   * Creates initial combat state from teams
   */
  createCombatState(heroTeam: Combatant[], enemyTeam: Combatant[]): Combat {
    return {
      heroTeam: { side: TeamSide.HERO, combatants: [...heroTeam] },
      enemyTeam: { side: TeamSide.ENEMY, combatants: [...enemyTeam] },
      turns: [],
      currentTurn: 0,
      outcome: CombatOutcome.IN_PROGRESS
    };
  }

  /**
   * Updates combatant states (alive/dead) based on current health
   */
  updateCombatantStates(combat: Combat): void {
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
  checkCombatEnd(combat: Combat): void {
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
   * Captures health states of all combatants at a given moment
   */
  captureAllCombatantsHealth(combat: Combat): CombatantHealthState[] {
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
   * Applies damage to a combatant
   */
  applyDamage(combatant: Combatant, damage: number): void {
    combatant.health = Math.max(0, combatant.health - damage);
    combatant.isAlive = combatant.health > 0 && !combatant.hasFled;
  }

  /**
   * Applies healing to a combatant
   */
  applyHealing(combatant: Combatant, healing: number): void {
    combatant.health = Math.min(combatant.maxHealth, combatant.health + healing);
  }

  /**
   * Marks a combatant as having fled
   */
  setCombatantFled(combatant: Combatant): void {
    combatant.hasFled = true;
    combatant.isAlive = false;
  }

  /**
   * Gets all alive combatants from both teams
   */
  getAliveCombatants(combat: Combat): Combatant[] {
    return [
      ...combat.heroTeam.combatants.filter(c => c.isAlive),
      ...combat.enemyTeam.combatants.filter(c => c.isAlive)
    ];
  }

  /**
   * Calculates total experience gained from defeated enemies
   */
  calculateExperienceGained(enemyTeam: CombatTeam): number {
    return enemyTeam.combatants
      .filter(enemy => !enemy.isAlive && !enemy.hasFled)
      .reduce((total, enemy) => {
        // Experience based on enemy stats
        const enemyPower = enemy.attack + enemy.defense + enemy.speed;
        return total + Math.floor(enemyPower * 2);
      }, 0);
  }

  /**
   * Generate a narrative summary of the combat encounter
   */
  generateCombatSummary(combat: Combat): string {
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
}
