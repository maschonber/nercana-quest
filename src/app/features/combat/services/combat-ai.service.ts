import { Injectable } from '@angular/core';
import {
  Combatant,
  CombatantType,
  CombatActionType,
  CombatTeam
} from '../models/combat.model';
import { StatusEffectManager } from './status-effect-manager.service';
import { StatusEffectType } from '../models/status-effect.model';
import { RandomService } from '../../../shared';
import { CombatAbility } from '../../quest/models/monster.model';

@Injectable({
  providedIn: 'root'
})
export class CombatAI {
  constructor(
    private statusEffectManager: StatusEffectManager,
    private randomService: RandomService
  ) {}

  /**
   * Determines what action a combatant should take
   */
  determineAction(
    actor: Combatant,
    opposingTeam: CombatTeam
  ): CombatActionType {
    if (actor.type === CombatantType.HERO) {
      return this.determineHeroAction(actor, opposingTeam);
    } else {
      return this.determineMonsterAction(actor, opposingTeam);
    }
  }

  /**
   * Selects the best target from the opposing team
   */
  selectTarget(opposingTeam: CombatTeam): Combatant | null {
    const availableTargets = opposingTeam.combatants.filter(
      (c) => c.isAlive && !c.hasFled
    );

    if (availableTargets.length === 0) {
      return null;
    }

    // If only one target, return it immediately
    if (availableTargets.length === 1) {
      return availableTargets[0];
    }

    // Calculate threat scores for each target
    const targetScores = availableTargets.map((target) => {
      const healthPercent = (target.health / target.maxHealth) * 100;
      let score = 0;

      // Priority 1: Identify potential healers/support (low attack, high speed)
      if (target.attack < 15 && target.speed > 20) {
        score += 100;
      }

      // Priority 2: Finish off weak enemies (< 30% health)
      if (healthPercent < 30) {
        score += 80 + (30 - healthPercent);
      }

      // Priority 3: High damage dealers (attack > 25)
      if (target.attack > 25) {
        score += 60 + (target.attack - 25);
      }

      // Priority 4: Medium health enemies (30-60% health)
      if (healthPercent >= 30 && healthPercent <= 60) {
        score += 40 + (60 - healthPercent);
      }

      // Speed bonus - fast enemies can act more often
      if (target.speed > 25) {
        score += 15;
      }

      // Defense penalty - hard to kill targets
      if (target.defense > 20) {
        score -= 20;
      }

      // Randomization factor (±10%) to prevent predictable behavior
      const randomFactor = this.randomService.randomVariance(1.0, 0.1);
      score *= randomFactor;

      return { target, score };
    });

    // Sort by score (highest first) and return the best target
    targetScores.sort((a, b) => b.score - a.score);
    return targetScores[0].target;
  }

  private determineHeroAction(
    hero: Combatant,
    opposingTeam: CombatTeam
  ): CombatActionType {
    const healthPercent = (hero.health / hero.maxHealth) * 100;
    const isDefending = this.statusEffectManager.hasStatusEffect(hero, StatusEffectType.DEFENDING);
    
    // Hero logic: 10% chance to flee if health is very low
    if (healthPercent <= 20 && this.randomService.rollDice(0.1)) {
      return CombatActionType.FLEE;
    }

    // Strategic defending logic
    if (!isDefending) {
      // Higher chance to defend when health is low
      if (healthPercent <= 30 && this.randomService.rollDice(0.4)) {
        return CombatActionType.DEFEND;
      }
      
      // Moderate chance when health is moderate
      if (healthPercent <= 50 && this.randomService.rollDice(0.25)) {
        return CombatActionType.DEFEND;
      }
      
      // Small chance even when healthy (tactical defending)
      if (this.randomService.rollDice(0.1)) {
        return CombatActionType.DEFEND;
      }
    }

    // Otherwise, attack
    return CombatActionType.ATTACK;
  }

  private determineMonsterAction(
    monster: Combatant,
    opposingTeam: CombatTeam
  ): CombatActionType {
    const healthPercent = (monster.health / monster.maxHealth) * 100;
    const isDefending = this.statusEffectManager.hasStatusEffect(monster, StatusEffectType.DEFENDING);
    
    // Check if monster has the ability to defend
    const canDefend = monster.abilities && monster.abilities.includes(CombatAbility.DEFEND);
    
    // Monster logic: Strategic defending when damaged and not already defending
    if (!isDefending && canDefend) {
      // High chance to defend when severely wounded
      if (healthPercent <= 25 && this.randomService.rollDice(0.3)) {
        return CombatActionType.DEFEND;
      }
      
      // Moderate chance when moderately wounded
      if (healthPercent <= 50 && this.randomService.rollDice(0.15)) {
        return CombatActionType.DEFEND;
      }
      
      // Small chance even when healthy (unpredictable behavior)
      if (this.randomService.rollDice(0.05)) {
        return CombatActionType.DEFEND;
      }
    }

    // Otherwise, always attack (monsters are aggressive)
    return CombatActionType.ATTACK;
  }
}
