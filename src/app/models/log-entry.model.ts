// Model for a log entry in Nercana
import { QuestStepType } from '../features/quest/models/quest.model';
import { Monster } from '../features/quest/models/monster.model';
import { CombatResult } from '../features/quest/models/combat.model';

export interface LogEntry {
  message: string;
  timestamp: Date;
  success: boolean;
  stepType?: QuestStepType;
  experienceGained?: number;
  goldGained?: number;
  monster?: Monster;
  combatResult?: CombatResult;
}
