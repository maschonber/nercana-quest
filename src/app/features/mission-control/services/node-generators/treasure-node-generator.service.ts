import { Injectable } from "@angular/core";
import { RandomService } from "../../../../shared";
import { MissionTheme, MissionNode, MissionNodeType, NodeReward } from "../../models/mission-path.model";
import { NodeGeneratorStrategy } from "./node-generator-strategy.service";

@Injectable({
  providedIn: 'root'
})
export class TreasureNodeGenerator implements NodeGeneratorStrategy {
  constructor(private randomService: RandomService) {}

  generateNode(theme: MissionTheme, difficulty: number, nodeId: string): MissionNode {
    const treasureData = this.generateTreasureData(theme, difficulty);
    
    return {
      id: nodeId,
      type: MissionNodeType.TREASURE,
      title: treasureData.title,
      description: treasureData.description,
      choices: [], // Will be populated by path generator
      rewards: this.generateTreasureRewards(theme, difficulty),
      content: {
        searchDifficulty: treasureData.searchDifficulty,
        hiddenItems: treasureData.hiddenItems,
        trapChance: treasureData.trapChance
      }
    };
  }

  private generateTreasureData(theme: MissionTheme, difficulty: number) {
    const themeTreasures = {
      [MissionTheme.PLANET]: {
        title: 'Geological Formation',
        description: 'Your clone discovers an unusual rock formation that may contain valuable minerals or artifacts.',
        searchDifficulty: difficulty + 1,
        hiddenItems: ['rare_minerals', 'fossil_data'],
        trapChance: 0.1
      },
      [MissionTheme.STATION]: {
        title: 'Storage Cache',
        description: 'A hidden storage compartment is detected in this section. It may contain valuable equipment or data.',
        searchDifficulty: difficulty,
        hiddenItems: ['tech_components', 'data_cores'],
        trapChance: 0.2
      },
      [MissionTheme.ASTEROID]: {
        title: 'Mineral Vein',
        description: 'Scanner readings indicate a rich mineral vein exposed in the asteroid wall. Extraction may be profitable.',
        searchDifficulty: difficulty - 1,
        hiddenItems: ['metal_ore', 'energy_crystals'],
        trapChance: 0.05
      },
      [MissionTheme.DERELICT]: {
        title: 'Captain\'s Safe',
        description: 'Your clone locates what appears to be the captain\'s quarters. A secure container draws attention.',
        searchDifficulty: difficulty + 2,
        hiddenItems: ['credits', 'nav_data', 'personal_effects'],
        trapChance: 0.3
      },
      [MissionTheme.NEBULA]: {
        title: 'Energy Anomaly',
        description: 'A stable energy anomaly pulses nearby. It may contain concentrated resources formed by nebula interactions.',
        searchDifficulty: difficulty,
        hiddenItems: ['energy_cells', 'exotic_matter'],
        trapChance: 0.15
      }
    };
    
    return themeTreasures[theme];
  }

  private generateTreasureRewards(theme: MissionTheme, difficulty: number): NodeReward[] {
    const rewards: NodeReward[] = [];
    
    // Base resource rewards based on theme
    const themeRewards = {
      [MissionTheme.PLANET]: { type: 'goo', base: 8 },
      [MissionTheme.STATION]: { type: 'metal', base: 6 },
      [MissionTheme.ASTEROID]: { type: 'metal', base: 12 },
      [MissionTheme.DERELICT]: { type: 'goo', base: 10 },
      [MissionTheme.NEBULA]: { type: 'metal', base: 15 }
    };
    
    const themeReward = themeRewards[theme];
    rewards.push({
      type: themeReward.type,
      quantity: themeReward.base + (difficulty * 3),
      probability: 0.8
    });
    
    // Chance for bonus rewards
    if (this.randomService.rollDice(0.3)) {
      rewards.push({
        type: 'experience',
        quantity: 5 + difficulty,
        probability: 0.6
      });
    }
    
    return rewards;
  }
}
