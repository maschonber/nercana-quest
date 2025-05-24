// Model for quest-related data in Nercana

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
}

export interface QuestResult {
  success: boolean;
  message: string;
  timestamp: Date;
  experienceGained: number;
  goldGained: number;
  steps: QuestStep[];
}
