import { MissionPath, MissionTheme, PathComplexity } from './mission-path.model';

export enum MissionType {
  EXPLORATION = 'exploration',
  MINING = 'mining',
  RESCUE = 'rescue',
  COMBAT = 'combat'
}

export enum MissionStatus {
  AVAILABLE = 'available',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed'
}

export interface MissionOutline {
  id: string;
  title: string;
  briefDescription: string;
  detailedDescription: string;
  imageUrl: string;
  travelTime: number; // in seconds
  challengeRating: number; // will be calculated based on encounters
  missionType: MissionType;
  status: MissionStatus;
  discoveredAt: Date;
  // New fields for mission path generation
  missionPath?: MissionPath;        // Generated mission path
  theme: MissionTheme;              // Mission environment theme
  pathComplexity: PathComplexity;   // Simple, moderate, complex
}
