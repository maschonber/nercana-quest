import { Injectable } from "@angular/core";
import { RandomService } from "../../../../shared";
import { MissionTheme, MissionNode, MissionNodeType, NodeReward } from "../../models/mission-path.model";
import { NodeGeneratorStrategy } from "./node-generator-strategy.service";

@Injectable({
  providedIn: 'root'
})
export class EncounterNodeGenerator implements NodeGeneratorStrategy {
  constructor(private randomService: RandomService) {}
  generateNode(theme: MissionTheme, difficulty: number, nodeId: string, depth: number, parentNodeId?: string): MissionNode {
    const encounterData = this.generateEncounterData(theme, difficulty);
    
    return {
      id: nodeId,
      type: MissionNodeType.ENCOUNTER,
      title: encounterData.title,
      description: encounterData.description,
      choices: [], // Will be populated by path generator
      rewards: this.generateCombatRewards(difficulty),
      content: {
        enemyTypes: encounterData.enemyTypes,
        encounterSize: this.getEncounterSize(difficulty),
        ambushChance: encounterData.ambushChance
      },
      depth,
      parentNodeId,
      isLeafNode: false // Will be set during path generation
    };
  }

  private generateEncounterData(theme: MissionTheme, difficulty: number) {
    const themeEncounters = {
      [MissionTheme.PLANET]: {
        title: 'Hostile Wildlife',
        description: 'Your clone detects movement in the terrain ahead. Local wildlife appears agitated and potentially dangerous.',
        enemyTypes: ['SPACE_SLUG', 'CRITTER'],
        ambushChance: 0.3
      },
      [MissionTheme.STATION]: {
        title: 'Security Systems',
        description: 'Automated defense systems activate as your clone enters this section. Combat protocols are engaged.',
        enemyTypes: ['STATION_DEFENSE', 'ROGUE_AI'],
        ambushChance: 0.2
      },
      [MissionTheme.ASTEROID]: {
        title: 'Mining Claim Dispute',
        description: 'Your clone encounters other miners who don\'t appreciate the intrusion. Tensions escalate quickly.',
        enemyTypes: ['SPACE_MERC', 'MERC_RAIDER'],
        ambushChance: 0.4
      },
      [MissionTheme.DERELICT]: {
        title: 'Ship Infestation',
        description: 'The ship\'s dark corridors harbor dangerous creatures that have made this place their home.',
        enemyTypes: ['XRIIT', 'XRIIT_SCOUT'],
        ambushChance: 0.5
      },
      [MissionTheme.NEBULA]: {
        title: 'Void Manifestation',
        description: 'Strange entities emerge from the nebula\'s energy fields, their intentions clearly hostile.',
        enemyTypes: ['VOID_ENTITY', 'MOGGO'],
        ambushChance: 0.2
      }
    };
    
    return themeEncounters[theme];
  }

  private getEncounterSize(difficulty: number): number {
    if (difficulty <= 2) return 1;
    if (difficulty <= 4) return this.randomService.rollDice(0.7) ? 1 : 2;
    return this.randomService.rollDice(0.5) ? 2 : 3;
  }

  private generateCombatRewards(difficulty: number): NodeReward[] {
    const baseRewards: NodeReward[] = [
      {
        type: 'experience',
        quantity: 10 + (difficulty * 5),
        probability: 1.0
      }
    ];

    // Add goo rewards for successful combat
    if (this.randomService.rollDice(0.8)) {
      baseRewards.push({
        type: 'goo',
        quantity: 5 + (difficulty * 2),
        probability: 0.9
      });
    }

    return baseRewards;
  }
}
