// Model for quest-related data in Nercana
import { CombatResult } from './combat.model';
import { Monster } from './monster.model';

export enum QuestStepType {
  EXPLORATION = 'exploration',
  ENCOUNTER = 'encounter',
  TREASURE = 'treasure'
}

export interface QuestStep {
  type: QuestStepType;
  message: string;
  timestamp: Date;
  success: boolean;
  experienceGained: number;
  goldGained: number;
  // For encounter steps that involve combat
  monster?: Monster;
  combatResult?: CombatResult;
}

export interface QuestResult {
  success: boolean;
  message: string;
  timestamp: Date;
  experienceGained: number;
  goldGained: number;
  steps: QuestStep[];
}
