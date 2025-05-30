// Model for combat system in Nercana
import { Hero } from '../../hero/models/hero.model';
import { Monster } from '../../quest/models/monster.model';
import { AppliedStatusEffect, StatusEffect } from './status-effect.model';

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
  statusEffects?: StatusEffect[]; // Status effects applied by this action
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
  statusEffects: AppliedStatusEffect[]; // Active status effects
}

export interface CombatantHealthState {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  isAlive: boolean;
  type: CombatantType;
  statusEffects: AppliedStatusEffect[];
}

export interface CombatTurn {
  turnNumber: number;
  combatTime: number; // Time in clicks when this turn occurred
  actorId: string; // ID of acting combatant
  action: CombatAction;
  actorHealthAfter: number;
  targetHealthAfter: number; // Comprehensive health tracking for all combatants after this turn
  allCombatantsHealth?: CombatantHealthState[];
  // Legacy fields maintained for current functionality - could be refactored to use allCombatantsHealth
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
}
