import { Injectable } from "@angular/core";
import { RandomService } from "../../../../shared";
import { MissionTheme, MissionNode, MissionNodeType } from "../../models/mission-path.model";
import { NodeGeneratorStrategy } from "./node-generator-strategy.service";

@Injectable({
  providedIn: 'root'
})
export class DecisionNodeGenerator implements NodeGeneratorStrategy {
  constructor(private randomService: RandomService) {}
  generateNode(theme: MissionTheme, difficulty: number, nodeId: string, depth: number, parentNodeId?: string): MissionNode {
    const decisionData = this.generateDecisionData(theme, difficulty);
    
    return {
      id: nodeId,
      type: MissionNodeType.DECISION,
      title: decisionData.title,
      description: decisionData.description,
      choices: [], // Will be populated by path generator
      content: {
        decisionType: decisionData.decisionType
      },
      depth,
      parentNodeId,
      isLeafNode: false // Decision nodes are never leaf nodes
    };
  }

  private generateDecisionData(theme: MissionTheme, difficulty: number) {
    const themeDecisions = {
      [MissionTheme.PLANET]: {
        title: 'Terrain Choice',
        description: 'Your clone reaches a junction where the path splits. The terrain ahead offers different routes with varying challenges.',
        decisionType: 'navigation'
      },
      [MissionTheme.STATION]: {
        title: 'System Override',
        description: 'Your clone encounters a control terminal. Different system overrides are available, each affecting the station differently.',
        decisionType: 'technical'
      },
      [MissionTheme.ASTEROID]: {
        title: 'Mining Route',
        description: 'Multiple mining tunnels branch off from this junction. Each tunnel shows different mineral signatures.',
        decisionType: 'exploration'
      },
      [MissionTheme.DERELICT]: {
        title: 'Ship Section',
        description: 'Your clone must choose which section of the derelict ship to explore. Each area shows different signs of activity.',
        decisionType: 'exploration'
      },
      [MissionTheme.NEBULA]: {
        title: 'Energy Field Navigation',
        description: 'Dense energy fields create multiple possible routes. Each path shows different energy signatures and hazards.',
        decisionType: 'navigation'
      }
    };
    
    return themeDecisions[theme];
  }
}
