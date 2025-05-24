// Model for a log entry in Nercana
import { QuestStepType } from '../features/quest/models/quest.model';

export interface LogEntry {
  message: string;
  timestamp: Date;
  success: boolean;
  stepType?: QuestStepType;
  experienceGained?: number;
  goldGained?: number;
}
