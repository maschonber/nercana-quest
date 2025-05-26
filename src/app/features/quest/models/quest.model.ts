// Model for quest-related data in Nercana
import { CombatResult } from './combat.model';
import { Monster } from './monster.model';

export enum QuestStepType {
  EXPLORATION = 'exploration',
  ENCOUNTER = 'encounter',
  TREASURE = 'treasure',
  QUEST_COMPLETE = 'quest_complete'
}

export interface QuestStep {
  type: QuestStepType;
  message: string;
  timestamp: Date;
  success: boolean;
  experienceGained: number;
  gooGained?: number;
  metalGained?: number;
  // For encounter steps that involve combat
  monster?: Monster; // Backward compatibility - single monster encounters
  monsters?: Monster[]; // New - multi-monster encounters
  combatResult?: CombatResult;
}

export interface QuestResult {
  questStatus: 'ongoing' | 'successful' | 'failed';
  message: string;
  timestamp: Date;
  experienceGained: number;
  gooGained?: number;
  metalGained?: number;
  steps: QuestStep[];
}
