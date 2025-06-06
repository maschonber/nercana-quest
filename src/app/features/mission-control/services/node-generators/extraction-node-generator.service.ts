import { Injectable } from "@angular/core";
import { RandomService } from "../../../../shared";
import { MissionTheme, MissionNode, MissionNodeType, NodeReward } from "../../models/mission-path.model";
import { NodeGeneratorStrategy } from "./node-generator-strategy.service";

@Injectable({
  providedIn: 'root'
})
export class ExtractionNodeGenerator implements NodeGeneratorStrategy {
  constructor(private randomService: RandomService) {}

  generateNode(theme: MissionTheme, difficulty: number, nodeId: string): MissionNode {
    const extractionData = this.getExtractionData(theme);
    
    return {
      id: nodeId,
      type: MissionNodeType.EXTRACTION,
      title: extractionData.title,
      description: extractionData.description,
      choices: [], // No choices - this is the final node
      rewards: this.generateMissionCompletionRewards(difficulty),
      content: {
        extractionMethod: extractionData.method,
        safeZone: true,
        missionComplete: true
      }
    };
  }

  private getExtractionData(theme: MissionTheme) {
    const themeExtractions = {
      [MissionTheme.PLANET]: {
        title: 'Surface Extraction Point',
        description: 'Your clone reaches the designated extraction point. The shuttle arrives to complete the mission.',
        method: 'shuttle_pickup'
      },
      [MissionTheme.STATION]: {
        title: 'Station Docking Bay',
        description: 'Your clone returns to the docking bay with mission objectives complete. Departure is clear.',
        method: 'station_departure'
      },
      [MissionTheme.ASTEROID]: {
        title: 'Mining Platform Exit',
        description: 'Your clone completes the asteroid mission and returns to the mining platform for extraction.',
        method: 'platform_departure'
      },
      [MissionTheme.DERELICT]: {
        title: 'Ship Airlock',
        description: 'Your clone exits the derelict ship through the main airlock, mission objectives achieved.',
        method: 'airlock_exit'
      },
      [MissionTheme.NEBULA]: {
        title: 'Research Station Hangar',
        description: 'Your clone reaches the research station\'s hangar bay, safely completing the nebula mission.',
        method: 'hangar_departure'
      }
    };
    
    return themeExtractions[theme];
  }

  private generateMissionCompletionRewards(difficulty: number): NodeReward[] {
    return [
      {
        type: 'experience',
        quantity: 25 + (difficulty * 10),
        probability: 1.0
      },
      {
        type: 'mission_bonus',
        quantity: 50 + (difficulty * 15),
        probability: 1.0
      }
    ];
  }
}
