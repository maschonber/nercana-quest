// Model for quest-related data in Nercana
export interface QuestResult {
  success: boolean;
  message: string;
  timestamp: Date;
  experienceGained: number;
  goldGained: number;
}
