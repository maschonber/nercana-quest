import { Injectable } from "@angular/core";
import { RandomService } from "../../../../shared";
import { MissionTheme, MissionNode, MissionNodeType, NodeReward } from "../../models/mission-path.model";
import { NodeGeneratorStrategy } from "./node-generator-strategy.service";

@Injectable({
  providedIn: 'root'
})
export class RestNodeGenerator implements NodeGeneratorStrategy {
  constructor(private randomService: RandomService) {}

  generateNode(theme: MissionTheme, difficulty: number, nodeId: string): MissionNode {
    const restData = this.generateRestData(theme);
    
    return {
      id: nodeId,
      type: MissionNodeType.REST,
      title: restData.title,
      description: restData.description,
      choices: [], // Will be populated by path generator
      rewards: this.generateRestRewards(),
      content: {
        healingAmount: restData.healingAmount
      }
    };
  }

  private generateRestData(theme: MissionTheme) {
    const themeRest = {
      [MissionTheme.PLANET]: {
        title: 'Shelter Cave',
        description: 'Your clone finds a natural cave formation that provides shelter from the elements and a chance to rest.',
        healingAmount: 20
      },
      [MissionTheme.STATION]: {
        title: 'Medical Bay',
        description: 'An operational medical bay provides an opportunity for healing and equipment maintenance.',
        healingAmount: 20
      },
      [MissionTheme.ASTEROID]: {
        title: 'Mining Rest Area',
        description: 'A pressurized rest area used by miners offers safety and recovery facilities.',
        healingAmount: 20
      },
      [MissionTheme.DERELICT]: {
        title: 'Intact Quarters',
        description: 'Your clone discovers crew quarters that remain sealed and habitable, offering respite.',
        healingAmount: 20
      },
      [MissionTheme.NEBULA]: {
        title: 'Shielded Observatory',
        description: 'A research station observatory provides protection from nebula radiation and rest facilities.',
        healingAmount: 20
      }
    };
    
    return themeRest[theme];
  }

  private generateRestRewards(): NodeReward[] {
    return [
      {
        type: 'health_recovery',
        quantity: 25,
        probability: 1.0
      },
      {
        type: 'experience',
        quantity: 3,
        probability: 0.5
      }
    ];
  }
}
