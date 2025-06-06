import { Injectable } from '@angular/core';
import { MissionOutline, MissionType } from '../models/mission-outline.model';
import {
  MissionPath,
  MissionNode,
  MissionTheme,
  PathComplexity,
  MissionNodeType,
  MissionChoice,
  RiskLevel
} from '../models/mission-path.model';
import { RandomService } from '../../../shared';
import { EncounterNodeGenerator } from './node-generators/encounter-node-generator.service';
import { ExtractionNodeGenerator } from './node-generators/extraction-node-generator.service';
import { LandingSiteGenerator } from './node-generators/landing-site-generator.service';
import { MiningNodeGenerator } from './node-generators/mining-node-generator.service';
import { NodeGeneratorStrategy } from './node-generators/node-generator-strategy.service';
import { RestNodeGenerator } from './node-generators/rest-node-generator.service';
import { TreasureNodeGenerator } from './node-generators/treasure-node-generator.service';

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
    private extractionGenerator: ExtractionNodeGenerator
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
  }

  createPath(outline: MissionOutline): MissionPath {
    const theme = this.determineTheme(outline);
    const complexity = this.determineComplexity(outline);
    return this.buildPath(theme, complexity, outline);
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

  private determineComplexity(outline: MissionOutline): PathComplexity {
    // Use existing complexity if already set, otherwise determine from challenge rating
    if (outline.pathComplexity) {
      return outline.pathComplexity;
    }

    if (outline.challengeRating <= 2) {
      return PathComplexity.LINEAR;
    } else if (outline.challengeRating <= 4) {
      return this.randomService.rollDice(0.7)
        ? PathComplexity.LINEAR
        : PathComplexity.BRANCHING;
    } else {
      const roll = this.randomService.random();
      if (roll < 0.3) return PathComplexity.LINEAR;
      if (roll < 0.8) return PathComplexity.BRANCHING;
      return PathComplexity.COMPLEX;
    }
  }

  private buildPath(
    theme: MissionTheme,
    complexity: PathComplexity,
    outline: MissionOutline
  ): MissionPath {
    const pathStructure = this.generatePathStructure(
      complexity,
      outline.challengeRating
    );
    const nodes = new Map<string, MissionNode>();

    // Generate nodes
    pathStructure.forEach((nodeType, index) => {
      const nodeId = `node_${index + 1}`;
      const generator = this.nodeGenerators.get(nodeType);

      if (!generator) {
        throw new Error(`No generator found for node type: ${nodeType}`);
      }

      const node = generator.generateNode(
        theme,
        outline.challengeRating,
        nodeId
      );
      nodes.set(nodeId, node);
    });

    // Connect nodes with choices
    this.connectNodes(Array.from(nodes.values()), pathStructure, complexity);

    return {
      startNodeId: 'node_1', // Always start with the first node (landing site)
      nodes,
      totalNodes: nodes.size,
      estimatedDuration: this.calculateEstimatedDuration(
        pathStructure,
        outline.challengeRating
      ),
      difficulty: outline.challengeRating
    };
  }

  private generatePathStructure(
    complexity: PathComplexity,
    challengeRating: number
  ): MissionNodeType[] {
    const structure: MissionNodeType[] = [];

    // Always start with landing site
    structure.push(MissionNodeType.LANDING_SITE);

    const nodePool = this.getNodePool(complexity, challengeRating);
    const targetNodeCount = this.getTargetNodeCount(complexity);

    // Fill middle nodes
    while (structure.length < targetNodeCount - 1) {
      const nodeType = this.randomService.randomChoice(nodePool);
      structure.push(nodeType);
    }

    // Always end with extraction
    structure.push(MissionNodeType.EXTRACTION);

    return structure;
  }

  private getNodePool(
    complexity: PathComplexity,
    challengeRating: number
  ): MissionNodeType[] {
    const basePool = [
      MissionNodeType.ENCOUNTER,
      MissionNodeType.TREASURE,
      MissionNodeType.MINING
    ];

    // Add rest nodes for longer/harder missions
    if (complexity !== PathComplexity.LINEAR || challengeRating >= 3) {
      basePool.push(MissionNodeType.REST);
    }

    // Add decision nodes for branching missions
    if (
      complexity === PathComplexity.BRANCHING ||
      complexity === PathComplexity.COMPLEX
    ) {
      basePool.push(MissionNodeType.DECISION);
    }

    return basePool;
  }

  private getTargetNodeCount(complexity: PathComplexity): number {
    switch (complexity) {
      case PathComplexity.LINEAR:
        return this.randomService.randomInt(3, 5);
      case PathComplexity.BRANCHING:
        return this.randomService.randomInt(5, 8);
      case PathComplexity.COMPLEX:
        return this.randomService.randomInt(8, 12);
      default:
        return 5;
    }
  }

  private connectNodes(
    nodes: MissionNode[],
    structure: MissionNodeType[],
    complexity: PathComplexity
  ): void {
    for (let i = 0; i < nodes.length - 1; i++) {
      const currentNode = nodes[i];
      const choices = this.generateChoicesForNode(
        currentNode,
        nodes,
        i,
        structure,
        complexity
      );
      currentNode.choices = choices;
    }
  }

  private generateChoicesForNode(
    currentNode: MissionNode,
    allNodes: MissionNode[],
    currentIndex: number,
    structure: MissionNodeType[],
    complexity: PathComplexity
  ): MissionChoice[] {
    const choices: MissionChoice[] = [];

    // For linear paths, always connect to next node
    if (
      complexity === PathComplexity.LINEAR ||
      currentIndex === allNodes.length - 2
    ) {
      const nextNode = allNodes[currentIndex + 1];
      choices.push(this.createChoice(nextNode, 'continue', RiskLevel.LOW));
    } else {
      // For branching paths, create multiple choices
      const branchingFactor = this.getBranchingFactor(
        complexity,
        currentIndex,
        allNodes.length
      );

      for (
        let i = 0;
        i < branchingFactor && currentIndex + i + 1 < allNodes.length;
        i++
      ) {
        const targetNode = allNodes[currentIndex + i + 1];
        const choiceType = this.getChoiceType(i, targetNode.type);
        const riskLevel = this.calculateRiskLevel(targetNode.type, i);

        choices.push(this.createChoice(targetNode, choiceType, riskLevel));
      }
    }

    return choices;
  }

  private getBranchingFactor(
    complexity: PathComplexity,
    currentIndex: number,
    totalNodes: number
  ): number {
    if (complexity === PathComplexity.LINEAR) return 1;

    // Reduce branching as we approach the end
    const remainingNodes = totalNodes - currentIndex - 1;
    if (remainingNodes <= 2) return 1;

    return complexity === PathComplexity.COMPLEX
      ? this.randomService.randomInt(1, 3)
      : this.randomService.randomInt(1, 2);
  }

  private createChoice(
    targetNode: MissionNode,
    choiceType: string,
    riskLevel: RiskLevel
  ): MissionChoice {
    const choiceLabels: Record<string, string> = {
      continue: 'Continue Forward',
      interact: 'Investigate Thoroughly',
      bypass: 'Find Bypass Route'
    };

    const choiceDescriptions: Record<string, string> = {
      continue: 'Proceed along the main path',
      interact: 'Spend extra time examining this area thoroughly',
      bypass: 'Look for a way around potential dangers'
    };

    return {
      id: `choice_${targetNode.id}`,
      label: choiceLabels[choiceType] || 'Continue',
      description: choiceDescriptions[choiceType] || 'Proceed to the next area',
      targetNodeId: targetNode.id,
      riskLevel
    };
  }

  private getChoiceType(
    choiceIndex: number,
    nodeType: MissionNodeType
  ): string {
    const choiceTypes = [
      'continue',
      'interact',
      'bypass'
    ];

    // Bias certain choice types based on node type
    if (nodeType === MissionNodeType.ENCOUNTER) {
      return choiceIndex === 0 ? 'interact' : 'bypass';
    } else if (nodeType === MissionNodeType.TREASURE) {
      return choiceIndex === 0 ? 'interact' : 'continue';
    } else {
      return choiceTypes[choiceIndex] || 'continue';
    }
  }

  private calculateRiskLevel(
    nodeType: MissionNodeType,
    choiceIndex: number
  ): RiskLevel {
    const baseRiskByType = {
      [MissionNodeType.LANDING_SITE]: RiskLevel.LOW,
      [MissionNodeType.ENCOUNTER]: RiskLevel.HIGH,
      [MissionNodeType.TREASURE]: RiskLevel.MEDIUM,
      [MissionNodeType.MINING]: RiskLevel.LOW,
      [MissionNodeType.REST]: RiskLevel.LOW,
      [MissionNodeType.DECISION]: RiskLevel.MEDIUM,
      [MissionNodeType.EXTRACTION]: RiskLevel.LOW
    };

    let baseRisk = baseRiskByType[nodeType];

    // Increase risk for alternative choices
    if (choiceIndex > 0) {
      if (baseRisk === RiskLevel.LOW) baseRisk = RiskLevel.MEDIUM;
      else if (baseRisk === RiskLevel.MEDIUM) baseRisk = RiskLevel.HIGH;
    }

    return baseRisk;
  }

  private calculateEstimatedDuration(
    structure: MissionNodeType[],
    challengeRating: number
  ): number {
    const baseDurationByType = {
      [MissionNodeType.LANDING_SITE]: 5,
      [MissionNodeType.ENCOUNTER]: 15,
      [MissionNodeType.TREASURE]: 10,
      [MissionNodeType.MINING]: 20,
      [MissionNodeType.REST]: 8,
      [MissionNodeType.DECISION]: 5,
      [MissionNodeType.EXTRACTION]: 5
    };

    const totalBaseDuration = structure.reduce((sum, nodeType) => {
      return sum + baseDurationByType[nodeType];
    }, 0);

    // Scale by difficulty
    const difficultyMultiplier = 1 + (challengeRating - 1) * 0.2;

    return Math.floor(totalBaseDuration * difficultyMultiplier);
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
