import { Injectable } from "@angular/core";
import { RandomService } from "../../../../shared";
import { MissionTheme, MissionNode, MissionNodeType, NodeReward } from "../../models/mission-path.model";
import { NodeGeneratorStrategy } from "./node-generator-strategy.service";

@Injectable({
  providedIn: 'root'
})
export class MiningNodeGenerator implements NodeGeneratorStrategy {
  constructor(private randomService: RandomService) {}

  generateNode(theme: MissionTheme, difficulty: number, nodeId: string): MissionNode {
    const miningData = this.generateMiningData(theme, difficulty);
    
    return {
      id: nodeId,
      type: MissionNodeType.MINING,
      title: miningData.title,
      description: miningData.description,
      choices: [], // Will be populated by path generator
      rewards: this.generateMiningRewards(theme, difficulty),
      content: {
        resourceType: miningData.resourceType,
        yield: miningData.yield
      }
    };
  }

  private generateMiningData(theme: MissionTheme, difficulty: number) {
    const themeMining = {
      [MissionTheme.PLANET]: {
        title: 'Surface Mining Site',
        description: 'Your clone identifies a surface deposit suitable for extraction. The operation will require time and energy.',
        resourceType: 'metal',
        yield: 1.2
      },
      [MissionTheme.ASTEROID]: {
        title: 'Deep Core Mining',
        description: 'A high-yield ore vein runs deep into the asteroid. Extraction is challenging but potentially very rewarding.',
        resourceType: 'metal',
        yield: 1.8
      },
      [MissionTheme.STATION]: {
        title: 'Power Core Extraction',
        description: 'The station\'s auxiliary power cores can be safely extracted.',
        resourceType: 'metal',
        yield: 1.1
      },
      [MissionTheme.DERELICT]: {
        title: 'Salvage Operation',
        description: 'Valuable components can be salvaged from the ship\'s systems, though care must be taken.',
        resourceType: 'metal',
        yield: 1.3
      },
      [MissionTheme.NEBULA]: {
        title: 'Energy Harvesting',
        description: 'The nebula\'s energy fields can be harvested using specialized equipment.',
        resourceType: 'goo',
        yield: 2.0
      }
    };
    
    return themeMining[theme];
  }

  private generateMiningRewards(theme: MissionTheme, difficulty: number): NodeReward[] {
    const miningData = this.generateMiningData(theme, difficulty);
    
    return [{
      type: miningData.resourceType,
      quantity: Math.floor((15 + (difficulty * 8)) * miningData.yield),
      probability: 0.95 // High success rate for mining operations
    }];
  }
}
