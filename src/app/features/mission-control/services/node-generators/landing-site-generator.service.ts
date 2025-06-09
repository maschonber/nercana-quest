import { Injectable } from "@angular/core";
import { RandomService } from "../../../../shared";
import { MissionTheme, MissionNode, MissionNodeType } from "../../models/mission-path.model";
import { NodeGeneratorStrategy } from "./node-generator-strategy.service";

@Injectable({
  providedIn: 'root'
})
export class LandingSiteGenerator implements NodeGeneratorStrategy {
  constructor(private randomService: RandomService) {}
  generateNode(theme: MissionTheme, difficulty: number, nodeId: string, depth: number, parentNodeId?: string): MissionNode {
    const themeData = this.getThemeData(theme);
    
    return {
      id: nodeId,
      type: MissionNodeType.LANDING_SITE,
      title: themeData.title,
      description: themeData.description,
      choices: [], // Will be populated by path generator
      content: {
        safeZone: true
      },
      depth,
      parentNodeId,
      isLeafNode: false // Landing site is never a leaf node
    };
  }

  private getThemeData(theme: MissionTheme): { title: string; description: string } {
    const themeDescriptions = {
      [MissionTheme.PLANET]: {
        title: 'Planetary Landing Site',
        description: 'Your clone touches down on the planet surface. The immediate area appears secure, with scanner readings showing multiple routes ahead.'
      },
      [MissionTheme.STATION]: {
        title: 'Station Docking Bay',
        description: 'Your clone docks at the station\'s outer ring. Emergency lighting flickers overhead, and multiple corridors lead deeper into the facility.'
      },
      [MissionTheme.ASTEROID]: {
        title: 'Asteroid Mining Platform',
        description: 'Your clone lands on the mining platform. Heavy machinery surrounds the area, and tunnel entrances lead into the asteroid\'s interior.'
      },
      [MissionTheme.DERELICT]: {
        title: 'Derelict Ship Airlock',
        description: 'Your clone enters through a damaged airlock. The ship\'s systems are mostly offline, but you detect multiple accessible sections.'
      },
      [MissionTheme.NEBULA]: {
        title: 'Nebula Research Outpost',
        description: 'Your clone arrives at a research station floating in the nebula. Strange energy readings permeate the area, affecting sensors.'
      }
    };
    
    return themeDescriptions[theme];
  }
}
