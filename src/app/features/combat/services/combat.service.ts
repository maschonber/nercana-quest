import { Injectable } from '@angular/core';
import { Hero } from '../../hero/models/hero.model';
import { Monster } from '../../quest/models/monster.model';
import { CombatResult } from '../models/combat.model';
import { CombatOrchestrator } from './combat-orchestrator.service';

@Injectable({
  providedIn: 'root'
})
export class CombatService {
  constructor(private combatOrchestrator: CombatOrchestrator) {}

  /**
   * Creates a team combat scenario from individual heroes and monsters
   * This is the main public interface for the combat system
   */
  createTeamCombat(heroes: Hero[], monsters: Monster[]): CombatResult {
    return this.combatOrchestrator.createTeamCombat(heroes, monsters);
  }
}
