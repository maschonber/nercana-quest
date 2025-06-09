import {
  MissionPath,
  MissionNode,
  MissionTheme,
  MissionNodeType,
  MissionChoice,
  RiskLevel
} from '../models/mission-path.model';
import { RandomService } from '../../../shared';
import { NodeGeneratorStrategy } from './node-generators/node-generator-strategy.service';

export class MissionPathBuilder {
  private nodes = new Map<string, MissionNode>();
  private nodeCounter = 0;
  private decisionNodeCount = 0; // Track decision nodes instead of general branches
  private currentDepth = 0;
  private pendingNodes: string[] = []; // Nodes that need children

  constructor(
    private randomService: RandomService,
    private theme: MissionTheme,
    private difficulty: number,
    private maxDepth: number,
    private nodeGenerators: Map<MissionNodeType, NodeGeneratorStrategy>
  ) {}

  static create(
    randomService: RandomService,
    theme: MissionTheme,
    difficulty: number,
    maxDepth: number,
    nodeGenerators: Map<MissionNodeType, NodeGeneratorStrategy>
  ): MissionPathBuilder {
    return new MissionPathBuilder(
      randomService,
      theme,
      difficulty,
      maxDepth,
      nodeGenerators
    );
  }

  addLandingSite(): MissionPathBuilder {
    const landingNodeId = this.getNextNodeId();
    const landingNode = this.nodeGenerators
      .get(MissionNodeType.LANDING_SITE)!
      .generateNode(this.theme, this.difficulty, landingNodeId, 0, undefined);

    this.nodes.set(landingNodeId, landingNode);
    this.pendingNodes.push(landingNodeId);
    this.currentDepth = 0;

    return this;
  }

  isComplete(): boolean {
    return (
      this.pendingNodes.length === 0 || this.currentDepth >= this.maxDepth - 1
    );
  }
  get currentBranchCount(): number {
    return this.decisionNodeCount;
  }  processNextLevel(): MissionPathBuilder {
    if (this.isComplete()) return this;

    const currentLevelNodes = [...this.pendingNodes];
    this.pendingNodes = [];
    this.currentDepth++;

    for (const parentNodeId of currentLevelNodes) {
      const shouldCreateDecision = this.shouldCreateDecisionNode();

      if (shouldCreateDecision) {
        this.createDecisionNode(parentNodeId);
      } else {
        this.createSingleContentNode(parentNodeId);
      }
    }

    return this;
  }

  private shouldCreateDecisionNode(): boolean {
    // Limit total decision nodes
    const decisionLimit = this.decisionNodeCount < 3;

    // Base probability around 25-30%
    return decisionLimit && this.randomService.rollDice(0.4);
  }

  private createDecisionNode(parentNodeId: string): void {
    // Create the decision node
    const decisionNodeId = this.getNextNodeId();
    const decisionNode = this.nodeGenerators
      .get(MissionNodeType.DECISION)!
      .generateNode(this.theme, this.difficulty, decisionNodeId, this.currentDepth, parentNodeId);
    
    this.nodes.set(decisionNodeId, decisionNode);
    this.decisionNodeCount++;

    // Create multiple content branches from this decision
    const numBranches = this.randomService.randomInt(2, 3);
    
    for (let i = 0; i < numBranches; i++) {
      const contentNode = this.createContentNode(decisionNodeId);
      this.nodes.set(contentNode.id, contentNode);
      
      // Add choice from decision to content node
      const choice = this.createChoiceForNode(contentNode);
      decisionNode.choices.push(choice);

      // Add content node to pending if not at max depth
      if (this.currentDepth < this.maxDepth - 1) {
        this.pendingNodes.push(contentNode.id);
      }
    }
  }

  private createSingleContentNode(parentNodeId: string): void {
    const contentNode = this.createContentNode(parentNodeId);
    this.nodes.set(contentNode.id, contentNode);

    // Add to pending if not at max depth
    if (this.currentDepth < this.maxDepth - 1) {
      this.pendingNodes.push(contentNode.id);
    }
  }
  private createContentNode(parentNodeId: string): MissionNode {
    const contentNodeTypes = [
      MissionNodeType.ENCOUNTER,
      MissionNodeType.TREASURE,
      MissionNodeType.MINING,
      MissionNodeType.REST
    ];

    const nodeType = this.randomService.randomChoice(contentNodeTypes);
    const generator = this.nodeGenerators.get(nodeType);

    if (!generator) {
      throw new Error(`No generator found for node type: ${nodeType}`);
    }

    const nodeId = this.getNextNodeId();
    return generator.generateNode(
      this.theme,
      this.difficulty,
      nodeId,
      this.currentDepth,
      parentNodeId
    );
  }

  addExtraction(): MissionPathBuilder {
    const extractionNodeId = 'extraction';
    const extractionNode = this.nodeGenerators
      .get(MissionNodeType.EXTRACTION)!
      .generateNode(
        this.theme,
        this.difficulty,
        extractionNodeId,
        this.maxDepth,
        undefined
      );

    this.nodes.set(extractionNodeId, extractionNode);

    // Connect all leaf nodes to extraction
    this.connectLeafNodesToExtraction(extractionNodeId);

    return this;
  }

  private connectLeafNodesToExtraction(extractionNodeId: string): void {
    // Find all leaf nodes (nodes with no children at max depth or last level)
    const leafNodes = this.findLeafNodes();

    leafNodes.forEach((leafNodeId) => {
      const leafNode = this.nodes.get(leafNodeId)!;
      const choice: MissionChoice = {
        id: `choice_${leafNodeId}_to_extraction`,
        label: 'Complete Mission',
        description: 'Return to extraction point and complete the mission',
        targetNodeId: extractionNodeId,
        riskLevel: RiskLevel.LOW
      };
      leafNode.choices.push(choice);
      leafNode.isLeafNode = true;
    });
  }

  private findLeafNodes(): string[] {
    const leafNodes: string[] = [];

    for (const [nodeId, node] of this.nodes) {
      if (node.type === MissionNodeType.EXTRACTION) continue;

      // A node is a leaf if it has no children (no other nodes have it as parent)
      const hasChildren = Array.from(this.nodes.values()).some(
        (otherNode) => otherNode.parentNodeId === nodeId
      );

      if (!hasChildren) {
        leafNodes.push(nodeId);
      }
    }

    return leafNodes;
  }  build(): MissionPath {
    // Add extraction
    this.addExtraction();

    // Generate choices for all non-leaf nodes
    this.generateChoices();

    return {
      startNodeId: 'node_1',
      extractionNodeId: 'extraction',
      nodes: this.nodes,
      totalNodes: this.nodes.size,
      maxDepth: this.maxDepth,
      branchCount: this.decisionNodeCount,
      difficulty: this.difficulty
    };
  }
  private generateChoices(): void {
    for (const [nodeId, node] of this.nodes) {
      // Skip nodes that already have choices or are terminal
      if (node.type === MissionNodeType.EXTRACTION || 
          node.type === MissionNodeType.DECISION || 
          node.isLeafNode) {
        continue;
      }

      // Content nodes get exactly one choice to their single child
      const childNodes = Array.from(this.nodes.values()).filter(
        (n) => n.parentNodeId === nodeId
      );

      if (childNodes.length === 1) {
        const choice = this.createChoiceForNode(childNodes[0]);
        node.choices.push(choice);
      } else if (childNodes.length === 0) {
        // This is a leaf node, will be connected to extraction
        node.isLeafNode = true;
      }
    }
  }

  private createChoiceForNode(targetNode: MissionNode): MissionChoice {
    const choiceLabels: Record<MissionNodeType, string[]> = {
      [MissionNodeType.LANDING_SITE]: ['Enter Area', 'Begin Mission'],
      [MissionNodeType.ENCOUNTER]: [
        'Engage Hostiles',
        'Enter Combat',
        'Face the Enemy'
      ],
      [MissionNodeType.TREASURE]: [
        'Investigate Cache',
        'Search for Treasure',
        'Examine Discovery'
      ],
      [MissionNodeType.MINING]: [
        'Begin Mining',
        'Extract Resources',
        'Start Operation'
      ],
      [MissionNodeType.REST]: [
        'Rest and Recover',
        'Take Shelter',
        'Establish Camp'
      ],
      [MissionNodeType.DECISION]: [
        'Evaluate Options',
        'Make Decision',
        'Choose Path'
      ],
      [MissionNodeType.EXTRACTION]: [
        'Complete Mission',
        'Return Home',
        'Extract'
      ]
    };

    const labels = choiceLabels[targetNode.type] || ['Continue'];
    const label = this.randomService.randomChoice(labels) as string;

    return {
      id: `choice_to_${targetNode.id}`,
      label,
      description: targetNode.description,
      targetNodeId: targetNode.id,
      riskLevel: this.calculateRiskLevel(targetNode.type)
    };
  }
  private calculateRiskLevel(nodeType: MissionNodeType): RiskLevel {
    const baseRiskByType = {
      [MissionNodeType.LANDING_SITE]: RiskLevel.LOW,
      [MissionNodeType.ENCOUNTER]: RiskLevel.HIGH,
      [MissionNodeType.TREASURE]: RiskLevel.MEDIUM,
      [MissionNodeType.MINING]: RiskLevel.LOW,
      [MissionNodeType.REST]: RiskLevel.LOW,
      [MissionNodeType.DECISION]: RiskLevel.MEDIUM,
      [MissionNodeType.EXTRACTION]: RiskLevel.LOW
    };

    return baseRiskByType[nodeType];
  }

  private getNextNodeId(): string {
    this.nodeCounter++;
    return `node_${this.nodeCounter}`;
  }
}
