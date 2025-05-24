// Model for combat system in Nercana
import { Hero } from '../../hero/models/hero.model';
import { Monster } from './monster.model';

export enum CombatActionType {
  ATTACK = 'attack',
  DEFEND = 'defend',
  SPECIAL = 'special',
  FLEE = 'flee'
}

export enum CombatOutcome {
  HERO_VICTORY = 'hero_victory',
  HERO_DEFEAT = 'hero_defeat',
  HERO_FLED = 'hero_fled',
  IN_PROGRESS = 'in_progress'
}

export enum CombatantType {
  HERO = 'hero',
  MONSTER = 'monster'
}

export interface CombatAction {
  type: CombatActionType;
  description: string;
  damage?: number;
  healing?: number;
  actorName: string;
  targetName: string;
  success: boolean;
}

export interface Combatant {
  name: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  type: CombatantType;
}

export interface CombatTurn {
  turnNumber: number;
  actor: CombatantType;
  action: CombatAction;
  actorHealthAfter: number;
  targetHealthAfter: number;
  heroHealthAfter: number;
  monsterHealthAfter: number;
}

export interface CombatResult {
  outcome: CombatOutcome;
  turns: CombatTurn[];
  experienceGained: number;
  goldGained: number;
  summary: string;
}

export interface Combat {
  hero: Hero;
  monster: Monster;
  turns: CombatTurn[];
  currentTurn: number;
  outcome: CombatOutcome;
}
