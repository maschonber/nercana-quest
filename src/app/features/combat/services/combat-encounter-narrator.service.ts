import { Injectable } from '@angular/core';
import {
  Combat,
  CombatOutcome,
  CombatantType,
  CombatTurn,
  Combatant
} from '../models/combat.model';
import { StatusEffectType } from '../models/status-effect.model';
import { RandomService } from '../../../shared';

/**
 * Service responsible for generating dramatic, setting-appropriate narrative descriptions
 * of combat encounters for the quest log. Creates varied, engaging stories that reflect
 * the actual progression and details of the fight.
 */
@Injectable({
  providedIn: 'root'
})
export class CombatEncounterNarratorService {
  
  constructor(private randomService: RandomService) {}
  /**
   * Generates a comprehensive encounter narrative based on the complete combat data.
   * The narrative starts with monster identification, describes fight progression,
   * and concludes with a dramatic outcome description followed by the neutral summary.
   */
  generateEncounterNarrative(combat: Combat): string {
    const enemyDescription = this.generateEnemyDescription(
      combat.enemyTeam.combatants
    );
    const progressionDescription = this.generateProgressionDescription(combat);
    const outcomeDescription = this.generateOutcomeDescription(combat);

    return `${enemyDescription} ${progressionDescription} ${outcomeDescription}`;
  }

  /**
   * Creates a dramatic description of the enemies encountered
   */
  private generateEnemyDescription(enemies: Combatant[]): string {
    if (enemies.length === 1) {
      const enemy = enemies[0];
      return this.getSingleEnemyIntroduction(enemy);
    } else if (enemies.length === 2) {
      return this.getDualEnemyIntroduction(enemies);
    } else {
      return this.getMultipleEnemyIntroduction(enemies);
    }
  }

  /**
   * Generates introduction text for a single enemy encounter
   */
  private getSingleEnemyIntroduction(enemy: Combatant): string {
    const introductions = [
      `Your clone detected hostile movement as a ${enemy.name} emerged from the shadows.`,
      `Scanner alerts blared as a dangerous ${enemy.name} materialized in the scanning perimeter.`,
      `The mission took a deadly turn when your clone encountered a prowling ${enemy.name}.`,
      `Warning klaxons echoed through the clone's comm as a ${enemy.name} blocked the mission path.`,      `Your clone's sensors locked onto a threatening ${enemy.name} in the operational zone.`
    ];
    return this.randomService.randomChoice(introductions);
  }

  /**
   * Generates introduction text for dual enemy encounters
   */
  private getDualEnemyIntroduction(enemies: Combatant[]): string {
    const [enemy1, enemy2] = enemies;
    const introductions = [
      `Your clone found itself cornered between a ${enemy1.name} and a ${enemy2.name}.`,
      `The situation escalated quickly as both a ${enemy1.name} and a ${enemy2.name} converged on your clone's position.`,
      `Hostile contacts multiplied - a ${enemy1.name} flanked your clone while a ${enemy2.name} blocked the escape route.`,      `Your clone's proximity alarms screamed as a deadly ${enemy1.name} and ${enemy2.name} coordinated their attack.`
    ];
    return this.randomService.randomChoice(introductions);
  }

  /**
   * Generates introduction text for multiple enemy encounters
   */
  private getMultipleEnemyIntroduction(enemies: Combatant[]): string {
    const count = enemies.length;
    const species = this.getDistinctSpecies(enemies);

    if (species.length === 1) {
      const introductions = [
        `Your clone stumbled into a ${species[0]} nest - ${count} hostile creatures surrounded the position.`,
        `Mission parameters changed drastically as a pack of ${count} ${species[0]}s swarmed your clone.`,
        `The scanning array detected multiple threats: ${count} ${species[0]}s moving in coordinated formation.`      ];
      return this.randomService.randomChoice(introductions);
    } else {
      const speciesNames = species.slice(0, 2).join(' and ');
      const introductions = [
        `Your clone faced a mixed hunting party: ${speciesNames} among ${count} total hostiles.`,
        `The tactical situation deteriorated as ${count} creatures including ${speciesNames} encircled your clone.`,
        `Multiple species convergence detected - ${speciesNames} leading a ${count}-strong hostile force.`
      ];
      return this.randomService.randomChoice(introductions);
    }
  }

  /**
   * Analyzes combat progression to create a narrative description
   */
  private generateProgressionDescription(combat: Combat): string {
    const duration = combat.turns.length;
    const intensity = this.analyzeCombatIntensity(combat);

    let progressionElements: string[] = [];

    // Duration-based descriptions
    if (duration <= 3) {
      progressionElements.push(this.getShortCombatDescription(intensity));
    } else if (duration <= 6) {
      progressionElements.push(this.getMediumCombatDescription(intensity));
    } else {
      progressionElements.push(this.getLongCombatDescription(intensity));
    }

    return progressionElements.join(' ');
  }

  /**
   * Analyzes the intensity of combat based on damage dealt and health changes
   */
  private analyzeCombatIntensity(combat: Combat): 'low' | 'medium' | 'high' {
    if (combat.turns.length === 0) return 'low';

    let totalDamageDealt = 0;
    let significantHealthSwings = 0;

    combat.turns.forEach((turn) => {
      if (turn.action.damage) {
        totalDamageDealt += turn.action.damage;
      }

      // Check for significant health changes (>20% of max health)
      const healthChange = Math.abs(
        turn.actorHealthAfter -
          (turn.actorHealthAfter + (turn.action.damage || 0))
      );
      if (healthChange > 20) {
        significantHealthSwings++;
      }
    });

    const averageDamagePerTurn = totalDamageDealt / combat.turns.length;

    if (
      averageDamagePerTurn > 25 ||
      significantHealthSwings > combat.turns.length * 0.6
    ) {
      return 'high';
    } else if (
      averageDamagePerTurn > 15 ||
      significantHealthSwings > combat.turns.length * 0.3
    ) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Generates description for short combat encounters
   */
  private getShortCombatDescription(intensity: string): string {
    const descriptions = {
      high: [
        'The firefight erupted in a blaze of weapon fire and desperate maneuvers.',
        'Combat was swift and brutal, with devastating exchanges of firepower.',
        'The engagement exploded into immediate violence with no quarter given.'
      ],
      medium: [
        'A tense standoff quickly escalated into active combat.',
        'The confrontation shifted from cautious positioning to direct engagement.',
        'Both sides committed to battle with calculated aggression.'
      ],
      low: [
        'The encounter began with careful probing attacks.',
        'Initial skirmishing gave way to more direct confrontation.',
        'The engagement started cautiously but soon intensified.'      ]
    };

    const options = descriptions[intensity as keyof typeof descriptions];
    return this.randomService.randomChoice(options);
  }

  /**
   * Generates description for medium-length combat encounters
   */
  private getMediumCombatDescription(intensity: string): string {
    const descriptions = {
      high: [
        'The battle raged with relentless fury as both sides traded devastating blows.',
        'Combat escalated into a fierce exchange of advanced weaponry and tactical maneuvers.',
        'The engagement became a desperate struggle for survival with heavy casualties mounting.'
      ],
      medium: [
        'The fight developed into a tactical exchange with measured aggression from both sides.',
        "Combat evolved through several phases as opponents tested each other's defenses.",
        'The battle progressed with strategic positioning and calculated strikes.'
      ],
      low: [
        'The encounter unfolded as a cautious dance of attack and defense.',
        'Combat proceeded with careful exchanges as both sides sought advantages.',
        'The engagement developed gradually with probing attacks and defensive maneuvers.'      ]
    };

    const options = descriptions[intensity as keyof typeof descriptions];
    return this.randomService.randomChoice(options);
  }

  /**
   * Generates description for long combat encounters
   */
  private getLongCombatDescription(intensity: string): string {
    const descriptions = {
      high: [
        'The extended battle became a war of attrition with neither side yielding ground easily.',
        'Combat stretched into a prolonged nightmare of constant weapon fire and tactical repositioning.',
        'The engagement devolved into a brutal endurance test with mounting casualties on all sides.'
      ],
      medium: [
        'The protracted fight saw multiple tactical shifts as both sides adapted their strategies.',
        'Combat extended through numerous exchanges with varying degrees of success for each participant.',
        'The lengthy engagement tested the limits of equipment and tactical acumen.'
      ],
      low: [
        'The drawn-out encounter proceeded with methodical exchanges and patient maneuvering.',
        'Combat evolved into a test of endurance with careful resource management.',
        'The extended engagement became a careful game of positioning and opportunity.'      ]
    };

    const options = descriptions[intensity as keyof typeof descriptions];
    return this.randomService.randomChoice(options);
  }

  /**
   * Generates dramatic outcome descriptions based on combat result
   */
  private generateOutcomeDescription(combat: Combat): string {
    switch (combat.outcome) {
      case CombatOutcome.HERO_VICTORY:
        return this.getVictoryDescription(combat);
      case CombatOutcome.HERO_DEFEAT:
        return this.getDefeatDescription(combat);
      case CombatOutcome.HERO_FLED:
        return this.getFleeDescription(combat);
      default:
        return 'The outcome remains uncertain.';
    }
  }  /**
   * Generates victory outcome descriptions based on survivors and health damage taken during battle
   */
  private getVictoryDescription(combat: Combat): string {
    const heroSurvivors = combat.heroTeam.combatants.filter(
      (c) => c.isAlive
    ).length;
    const totalHeroes = combat.heroTeam.combatants.length;
    
    // Calculate percentage of health lost during this battle
    const healthLossPercentage = this.calculateBattleHealthLossPercentage(combat.heroTeam.combatants);
    
    if (heroSurvivors === totalHeroes) {
      // All survived - differentiate by health damage taken during battle
      if (healthLossPercentage <= 0.2) {
        // Minimal damage taken (≤20% health lost)
        const descriptions = [
          'Your clone emerged triumphant, systems intact and mission parameters exceeded.',
          'Victory was achieved with tactical excellence - your clone sustained minimal damage.',
          'The engagement concluded with your clone standing victorious over the fallen hostiles.',
          'Mission success confirmed: your clone neutralized all threats with superior execution.'        ];
        return this.randomService.randomChoice(descriptions);
      } else if (healthLossPercentage <= 0.4) {
        // Moderate damage taken (21-40% health lost)
        const descriptions = [
          'Your clone achieved victory despite taking significant damage in the fierce engagement.',
          'Victory was secured, though your clone bears the scars of a hard-fought battle.',
          'The hostile forces were neutralized, but not without testing your clone\'s resilience.',
          'Mission success confirmed, though your clone\'s systems show considerable battle damage.'
        ];
        return this.randomService.randomChoice(descriptions);
      } else {
        // Heavy damage taken (>40% health lost)
        const descriptions = [
          'Your clone claimed victory by the narrowest of margins, systems critically damaged but operational.',
          'Against overwhelming odds, your clone emerged victorious despite severe battle trauma.',
          'Victory was achieved through sheer determination as your clone fought through critical damage.',
          'The engagement ended in success, though your clone barely survived the brutal confrontation.'
        ];
        return this.randomService.randomChoice(descriptions);
      }
    } else {
      // Some clones died - this is always a costly victory regardless of remaining health
      const descriptions = [
        "Victory came at a price, but your clone's sacrifice secured the mission objective.",
        'Despite heavy losses, the engagement ended with tactical superiority confirmed.',
        'Your clone achieved mission success through determination and tactical prowess.',        'The hostile forces were eliminated, though not without significant cost to your team.'
      ];
      return this.randomService.randomChoice(descriptions);
    }
  }

  /**
   * Calculates the percentage of health lost during the battle across all heroes
   */
  private calculateBattleHealthLossPercentage(heroes: Combatant[]): number {
    if (heroes.length === 0) return 0;
    
    let totalHealthLost = 0;
    let totalStartingHealth = 0;
    
    heroes.forEach(hero => {
      // Assume heroes started at maxHealth at the beginning of battle
      const startingHealth = hero.maxHealth;
      const currentHealth = hero.isAlive ? hero.health : 0;
      const healthLost = startingHealth - currentHealth;
      
      totalHealthLost += healthLost;
      totalStartingHealth += startingHealth;
    });
    
    return totalStartingHealth > 0 ? totalHealthLost / totalStartingHealth : 0;
  }
  /**
   * Generates defeat outcome descriptions
   */
  private getDefeatDescription(combat: Combat): string {
    const descriptions = [
      'The engagement ended in catastrophic failure - clone termination confirmed.',
      'Hostile forces proved overwhelming; your clone was eliminated in the conflict.',
      'Mission failure: your clone was destroyed by superior enemy forces.',
      'The tactical situation collapsed - your clone was eliminated in the failed engagement.',      'Enemy superiority was absolute - your clone was eliminated in the encounter.'
    ];
    return this.randomService.randomChoice(descriptions);
  }  /**
   * Generates flee outcome descriptions
   */
  private getFleeDescription(combat: Combat): string {
    const descriptions = [
      'Your clone executed emergency withdrawal protocols, preserving unit integrity.',
      'Tactical retreat was initiated when mission parameters became untenable.',
      'Your clone withdrew from combat, citing unfavorable odds assessment.',
      'Emergency protocols were activated to prevent total unit loss.',      'Your clone withdrew from the engagement zone to fight another day.'
    ];
    return this.randomService.randomChoice(descriptions);
  }

  /**
   * Extracts distinct species names from enemy combatants
   */
  private getDistinctSpecies(enemies: Combatant[]): string[] {
    const species = new Set<string>();
    enemies.forEach((enemy) => {
      // Extract species name (assuming format like "Moggo Warrior" -> "Moggo")
      const speciesName = enemy.name.split(' ')[0];
      species.add(speciesName);
    });
    return Array.from(species);
  }
}
