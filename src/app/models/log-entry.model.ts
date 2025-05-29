// Model for a log entry in Nercana
import { CombatResult } from '../features/combat';
import { QuestStepType } from '../features/quest/models/quest.model';
import { Monster } from '../features/quest/models/monster.model';

export interface LogEntry {
  message: string;
  timestamp: Date;
  success: boolean;
  stepType?: QuestStepType;
  experienceGained?: number;
  gooGained?: number;
  metalGained?: number;
  monster?: Monster; // Backward compatibility - single monster encounters
  monsters?: Monster[]; // New - multi-monster encounters
  combatResult?: CombatResult;
}
