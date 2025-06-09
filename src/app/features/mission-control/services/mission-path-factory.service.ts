import { Injectable } from '@angular/core';
import { MissionOutline, MissionType } from '../models/mission-outline.model';
import {
  MissionPath,
  MissionTheme,
  MissionNodeType
} from '../models/mission-path.model';
import { RandomService } from '../../../shared';
import { EncounterNodeGenerator } from './node-generators/encounter-node-generator.service';
import { ExtractionNodeGenerator } from './node-generators/extraction-node-generator.service';
import { LandingSiteGenerator } from './node-generators/landing-site-generator.service';
import { MiningNodeGenerator } from './node-generators/mining-node-generator.service';
import { NodeGeneratorStrategy } from './node-generators/node-generator-strategy.service';
import { RestNodeGenerator } from './node-generators/rest-node-generator.service';
import { TreasureNodeGenerator } from './node-generators/treasure-node-generator.service';
import { DecisionNodeGenerator } from './node-generators/decision-node-generator.service';
import { MissionPathBuilder } from './mission-path-builder.service';

@Injectable({
  providedIn: 'root'
})
export class MissionPathFactory {
  private nodeGenerators: Map<MissionNodeType, NodeGeneratorStrategy> =
    new Map();

  constructor(
    private randomService: RandomService,
    private landingSiteGenerator: LandingSiteGenerator,
    private encounterGenerator: EncounterNodeGenerator,
    private treasureGenerator: TreasureNodeGenerator,
    private miningGenerator: MiningNodeGenerator,
    private restGenerator: RestNodeGenerator,
    private extractionGenerator: ExtractionNodeGenerator,
    private decisionGenerator: DecisionNodeGenerator
  ) {
    this.initializeGenerators();
  }

  private initializeGenerators(): void {
    this.nodeGenerators.set(
      MissionNodeType.LANDING_SITE,
      this.landingSiteGenerator
    );
    this.nodeGenerators.set(MissionNodeType.ENCOUNTER, this.encounterGenerator);
    this.nodeGenerators.set(MissionNodeType.TREASURE, this.treasureGenerator);
    this.nodeGenerators.set(MissionNodeType.MINING, this.miningGenerator);
    this.nodeGenerators.set(MissionNodeType.REST, this.restGenerator);
    this.nodeGenerators.set(
      MissionNodeType.EXTRACTION,
      this.extractionGenerator
    );
    this.nodeGenerators.set(MissionNodeType.DECISION, this.decisionGenerator);
  }

  createPath(outline: MissionOutline): MissionPath {
    const theme = this.determineTheme(outline);
    const maxDepth = this.getTargetDepth(outline.challengeRating);

    const builder = MissionPathBuilder.create(
      this.randomService,
      theme,
      outline.challengeRating,
      maxDepth,
      this.nodeGenerators
    ).addLandingSite();

    // Build the tree iteratively
    while (!builder.isComplete()) {
      builder.processNextLevel();
    }

    return builder.build();
  }

  private determineTheme(outline: MissionOutline): MissionTheme {
    // Use existing theme if already set, otherwise determine from mission type
    if (outline.theme) {
      return outline.theme;
    }

    const themeWeights = {
      [MissionType.EXPLORATION]: {
        [MissionTheme.PLANET]: 0.3,
        [MissionTheme.STATION]: 0.2,
        [MissionTheme.ASTEROID]: 0.1,
        [MissionTheme.DERELICT]: 0.2,
        [MissionTheme.NEBULA]: 0.2
      },
      [MissionType.MINING]: {
        [MissionTheme.PLANET]: 0.2,
        [MissionTheme.STATION]: 0.1,
        [MissionTheme.ASTEROID]: 0.5,
        [MissionTheme.DERELICT]: 0.1,
        [MissionTheme.NEBULA]: 0.1
      },
      [MissionType.RESCUE]: {
        [MissionTheme.PLANET]: 0.1,
        [MissionTheme.STATION]: 0.4,
        [MissionTheme.ASTEROID]: 0.1,
        [MissionTheme.DERELICT]: 0.3,
        [MissionTheme.NEBULA]: 0.1
      },
      [MissionType.COMBAT]: {
        [MissionTheme.PLANET]: 0.2,
        [MissionTheme.STATION]: 0.3,
        [MissionTheme.ASTEROID]: 0.2,
        [MissionTheme.DERELICT]: 0.2,
        [MissionTheme.NEBULA]: 0.1
      }
    };

    return this.weightedRandomChoice(themeWeights[outline.missionType]);
  }

  private getTargetDepth(challengeRating: number): number {
    // Base depth is 3-5, scaled by difficulty
    const baseDepth = 3;
    const additionalDepth = Math.round(challengeRating / 2);
    return Math.min(baseDepth + additionalDepth, 7);
  }

  private weightedRandomChoice(weights: Record<string, number>): MissionTheme {
    const entries = Object.entries(weights);
    const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);

    let random = this.randomService.random() * totalWeight;

    for (const [theme, weight] of entries) {
      random -= weight;
      if (random <= 0) {
        return theme as MissionTheme;
      }
    }

    // Fallback
    return entries[0][0] as MissionTheme;
  }

  validateMissionPath(path: MissionPath): boolean {
    // Validate path structure
    if (!path.startNodeId || !path.nodes.has(path.startNodeId)) {
      return false;
    }

    // Validate all nodes are reachable
    const reachableNodes = new Set<string>();
    const toVisit = [path.startNodeId];

    while (toVisit.length > 0) {
      const nodeId = toVisit.pop()!;
      if (reachableNodes.has(nodeId)) continue;

      reachableNodes.add(nodeId);
      const node = path.nodes.get(nodeId);

      if (node) {
        node.choices.forEach((choice) => {
          if (!reachableNodes.has(choice.targetNodeId)) {
            toVisit.push(choice.targetNodeId);
          }
        });
      }
    }

    // All nodes should be reachable
    return reachableNodes.size === path.nodes.size;
  }
}
