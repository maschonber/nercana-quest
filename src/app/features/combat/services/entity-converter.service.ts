import { Injectable } from '@angular/core';
import { Hero } from '../../hero/models/hero.model';
import { Monster } from '../../quest/models/monster.model';
import { Combatant, CombatantType } from '../models/combat.model';

@Injectable({
  providedIn: 'root'
})
export class EntityConverter {
  /**
   * Convert hero or monster to combatant interface
   */ private toCombatant(
    entity: Hero | Monster,
    type: CombatantType,
    id: string
  ): Combatant {
    return {
      id,
      name: entity.name,
      health: entity.health,
      maxHealth:
        type === CombatantType.HERO
          ? (entity as Hero).maxHealth
          : (entity as Monster).maxHealth,
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
    return this.toCombatant(
      hero,
      CombatantType.HERO,
      id || `hero-${hero.name}`
    );
  }

  /**
   * Creates a combatant from a monster entity
   */
  createMonsterCombatant(monster: Monster, id?: string): Combatant {
    return this.toCombatant(
      monster,
      CombatantType.MONSTER,
      id || `monster-${monster.name}`
    );
  }

  /**
   * Convert arrays of heroes and monsters to combatant teams
   */
  createCombatantTeams(
    heroes: Hero[],
    monsters: Monster[]
  ): { heroTeam: Combatant[]; enemyTeam: Combatant[] } {
    const heroTeam = heroes.map((hero, index) =>
      this.createHeroCombatant(hero, `hero-${index}-${hero.name}`)
    );

    const enemyTeam = monsters.map((monster, index) =>
      this.createMonsterCombatant(monster, `monster-${index}-${monster.name}`)
    );

    return { heroTeam, enemyTeam };
  }
}
