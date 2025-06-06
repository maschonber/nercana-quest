import { Injectable } from '@angular/core';
import { MissionOutline, MissionType, MissionStatus } from '../models/mission-outline.model';
import { MissionPath, MissionTheme, PathComplexity } from '../models/mission-path.model';
import { MissionPathFactory } from './mission-path-factory.service';

@Injectable({
  providedIn: 'root'
})
export class MissionService {
  private readonly MAX_MISSIONS = 8;

  constructor(private missionPathFactory: MissionPathFactory) {}

  private readonly missionTitles = [
    'Deep Space Patrol',
    'Asteroid Survey',
    'Station Check',
    'Resource Collection',
    'Anomaly Investigation',
    'Signal Tracking',
    'Equipment Recovery',
    'Sector Reconnaissance'
  ];

  private readonly briefDescriptions = [
    'Patrol deep space sector for anomalous activity.',
    'Survey asteroid field for valuable resources.',
    'Perform routine maintenance check on remote station.',
    'Collect rare materials from designated coordinates.',
    'Investigate unusual energy readings in sector.',
    'Track and analyze mysterious signal source.',
    'Recover critical equipment from abandoned outpost.',
    'Conduct reconnaissance of uncharted territory.'
  ];

  private readonly detailedDescriptions = [
    'This mission involves a comprehensive patrol of the outer rim sectors. Clones will navigate through multiple waypoints, scanning for unusual activity and potential threats. Expected encounters include minor debris fields and possible hostile contacts.',
    'A detailed survey mission targeting a resource-rich asteroid belt. Clones will analyze mineral composition, identify extraction opportunities, and map the most valuable deposits for future mining operations.',
    'Routine maintenance mission to ensure operational readiness of remote installations. Clones will perform diagnostics, repair minor systems, and update security protocols at the designated station.',
    'Resource acquisition mission targeting rare materials essential for station operations. Clones will navigate to specific coordinates and extract valuable compounds using specialized equipment.',
    'Investigation mission to analyze unexplained energy phenomena detected by long-range sensors. Clones will gather data, samples, and attempt to determine the source of the anomalous readings.',
    'Signal analysis mission to track and decode mysterious transmissions from unknown sources. Clones will use advanced communication equipment to triangulate and investigate the signal origin.',
    'Recovery operation to retrieve critical equipment from an abandoned research outpost. Clones will navigate hazardous terrain and secure valuable technology before it degrades further.',
    'Reconnaissance mission to explore and map previously uncharted sectors. Clones will gather intelligence on potential threats, resources, and strategic locations for future operations.'
  ];

  generateMissionOutline(): MissionOutline {
    const titleIndex = Math.floor(Math.random() * this.missionTitles.length);
    const descIndex = Math.floor(Math.random() * this.briefDescriptions.length);
    const detailIndex = Math.floor(Math.random() * this.detailedDescriptions.length);
    
    const missionTypes = Object.values(MissionType);
    const randomType = missionTypes[Math.floor(Math.random() * missionTypes.length)];
    
    // Generate travel time between 30 seconds and 10 minutes
    const travelTime = Math.floor(Math.random() * (600 - 30) + 30);
    
    // Generate challenge rating between 1 and 5
    const challengeRating = Math.floor(Math.random() * 5) + 1;

    const outline: MissionOutline = {
      id: this.generateId(),
      title: this.missionTitles[titleIndex],
      briefDescription: this.briefDescriptions[descIndex],
      detailedDescription: this.detailedDescriptions[detailIndex],
      imageUrl: 'assets/mission/placeholder.png',
      travelTime,
      challengeRating,
      missionType: randomType,
      status: MissionStatus.AVAILABLE,
      discoveredAt: new Date(),
      theme: this.generateRandomTheme(),
      pathComplexity: this.generateRandomComplexity(challengeRating)
    };

    // Generate mission path
    outline.missionPath = this.generateMissionPath(outline);

    if (!this.validateMissionPath(outline.missionPath)) {
      console.error('Generated mission path is invalid:', outline.missionPath);
    }

    return outline;
  }

  generateMissionPath(outline: MissionOutline): MissionPath {
    return this.missionPathFactory.createPath(outline);
  }

  validateMissionPath(path: MissionPath): boolean {
    return this.missionPathFactory.validateMissionPath(path);
  }

  canScanNewMission(currentMissionCount: number): boolean {
    return currentMissionCount < this.MAX_MISSIONS;
  }

  private generateRandomTheme(): MissionTheme {
    const themes = Object.values(MissionTheme);
    return themes[Math.floor(Math.random() * themes.length)];
  }

  private generateRandomComplexity(challengeRating: number): PathComplexity {
    if (challengeRating <= 2) {
      return PathComplexity.LINEAR;
    } else if (challengeRating <= 4) {
      return Math.random() < 0.7 ? PathComplexity.LINEAR : PathComplexity.BRANCHING;
    } else {
      const roll = Math.random();
      if (roll < 0.3) return PathComplexity.LINEAR;
      if (roll < 0.8) return PathComplexity.BRANCHING;
      return PathComplexity.COMPLEX;
    }
  }

  private generateId(): string {
    return 'mission_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
