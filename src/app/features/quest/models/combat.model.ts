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

export interface CombatAction {
  type: CombatActionType;
  description: string;
  damage?: number;
  healing?: number;
  actorName: string;
  targetName: string;
  success: boolean;
}

export interface CombatRound {
  roundNumber: number;
  heroAction: CombatAction;
  monsterAction: CombatAction;
  heroHealthAfter: number;
  monsterHealthAfter: number;
}

export interface CombatResult {
  outcome: CombatOutcome;
  rounds: CombatRound[];
  experienceGained: number;
  goldGained: number;
  summary: string;
}

export interface Combat {
  hero: Hero;
  monster: Monster;
  rounds: CombatRound[];
  currentRound: number;
  outcome: CombatOutcome;
}
