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

export enum TeamSide {
  HERO = 'hero',
  ENEMY = 'enemy'
}

export interface CombatAction {
  type: CombatActionType;
  description: string;
  damage?: number;
  healing?: number;
  actorId: string; // ID of acting combatant
  actorName: string;
  targetId: string; // ID of target combatant
  targetName: string;
  success: boolean;
}

export interface Combatant {
  id: string; // Unique identifier for targeting
  name: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  type: CombatantType;
  isAlive: boolean; // Quick check for combat eligibility
  hasFled: boolean; // Track if combatant has fled
}

export interface CombatTurn {
  turnNumber: number;
  actorId: string; // ID of acting combatant
  action: CombatAction;
  actorHealthAfter: number;
  targetHealthAfter: number;
  // Legacy fields for backward compatibility - can be removed later
  heroHealthAfter: number;
  monsterHealthAfter: number;
}

export interface CombatTeam {
  side: TeamSide;
  combatants: Combatant[];
}

export interface CombatResult {
  outcome: CombatOutcome;
  turns: CombatTurn[];
  experienceGained: number;
  summary: string;
}

export interface Combat {
  heroTeam: CombatTeam;
  enemyTeam: CombatTeam;
  turns: CombatTurn[];
  currentTurn: number;
  outcome: CombatOutcome;
  
  // Legacy fields for backward compatibility - can be removed later
  hero?: Hero;
  monster?: Monster;
}
