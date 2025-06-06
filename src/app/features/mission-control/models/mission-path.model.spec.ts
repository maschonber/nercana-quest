import { MissionNodeType, RiskLevel, MissionTheme, PathComplexity, MissionNode, MissionChoice, MissionPath } from './mission-path.model';

describe('Mission Path Models', () => {
  describe('MissionNodeType enum', () => {
    it('should have all expected node types', () => {
      expect(MissionNodeType.LANDING_SITE).toBe('landing_site');
      expect(MissionNodeType.ENCOUNTER).toBe('encounter');
      expect(MissionNodeType.TREASURE).toBe('treasure');
      expect(MissionNodeType.MINING).toBe('mining');
      expect(MissionNodeType.REST).toBe('rest');
      expect(MissionNodeType.DECISION).toBe('decision');
      expect(MissionNodeType.EXTRACTION).toBe('extraction');
    });
  });

  describe('RiskLevel enum', () => {
    it('should have all expected risk levels', () => {
      expect(RiskLevel.LOW).toBe('low');
      expect(RiskLevel.MEDIUM).toBe('medium');
      expect(RiskLevel.HIGH).toBe('high');
    });
  });

  describe('MissionTheme enum', () => {
    it('should have all expected themes', () => {
      expect(MissionTheme.PLANET).toBe('planet');
      expect(MissionTheme.STATION).toBe('station');
      expect(MissionTheme.ASTEROID).toBe('asteroid');
      expect(MissionTheme.DERELICT).toBe('derelict');
      expect(MissionTheme.NEBULA).toBe('nebula');
    });
  });

  describe('PathComplexity enum', () => {
    it('should have all expected complexity levels', () => {
      expect(PathComplexity.LINEAR).toBe('linear');
      expect(PathComplexity.BRANCHING).toBe('branching');
      expect(PathComplexity.COMPLEX).toBe('complex');
    });
  });

  describe('MissionChoice interface', () => {
    it('should create valid choice objects', () => {
      const choice: MissionChoice = {
        id: 'choice_1',
        label: 'Continue Forward',
        description: 'Proceed along the main path',
        targetNodeId: 'node_2',
        riskLevel: RiskLevel.LOW
      };

      expect(choice.id).toBe('choice_1');
      expect(choice.label).toBe('Continue Forward');
      expect(choice.description).toBe('Proceed along the main path');
      expect(choice.targetNodeId).toBe('node_2');
      expect(choice.riskLevel).toBe(RiskLevel.LOW);
    });
  });

  describe('MissionNode interface', () => {
    it('should create valid node objects', () => {
      const node: MissionNode = {
        id: 'node_1',
        type: MissionNodeType.LANDING_SITE,
        title: 'Starting Point',
        description: 'The beginning of your mission',
        choices: []
      };

      expect(node.id).toBe('node_1');
      expect(node.type).toBe(MissionNodeType.LANDING_SITE);
      expect(node.title).toBe('Starting Point');
      expect(node.description).toBe('The beginning of your mission');
      expect(node.choices).toEqual([]);
    });

    it('should support optional properties', () => {
      const node: MissionNode = {
        id: 'node_1',
        type: MissionNodeType.TREASURE,
        title: 'Treasure Cache',
        description: 'A hidden cache of resources',
        choices: [],
        requirements: [
          { type: 'skill', value: 'mining' }
        ],
        rewards: [
          { type: 'metal', quantity: 10, probability: 0.8 }
        ],
        content: {
          searchDifficulty: 3,
          hiddenItems: ['rare_metals']
        }
      };      expect(node.requirements).toBeDefined();
      expect(node.rewards).toBeDefined();
      expect(node.content).toBeDefined();
      expect(node.requirements![0].type).toBe('skill');
      expect(node.rewards![0].type).toBe('metal');
      expect(node.content!['searchDifficulty']).toBe(3);
    });
  });

  describe('MissionPath interface', () => {
    it('should create valid path objects', () => {
      const nodes = new Map<string, MissionNode>();
      const landingNode: MissionNode = {
        id: 'node_1',
        type: MissionNodeType.LANDING_SITE,
        title: 'Landing Site',
        description: 'Start here',
        choices: []
      };
      nodes.set('node_1', landingNode);

      const path: MissionPath = {
        startNodeId: 'node_1',
        nodes,
        totalNodes: 1,
        estimatedDuration: 30,
        difficulty: 2
      };

      expect(path.startNodeId).toBe('node_1');
      expect(path.nodes.size).toBe(1);
      expect(path.totalNodes).toBe(1);
      expect(path.estimatedDuration).toBe(30);
      expect(path.difficulty).toBe(2);
    });

    it('should support node lookups', () => {
      const nodes = new Map<string, MissionNode>();
      const node1: MissionNode = {
        id: 'node_1',
        type: MissionNodeType.LANDING_SITE,
        title: 'Start',
        description: 'Beginning',
        choices: []
      };
      const node2: MissionNode = {
        id: 'node_2',
        type: MissionNodeType.ENCOUNTER,
        title: 'Combat',
        description: 'Fight',
        choices: []
      };
      
      nodes.set('node_1', node1);
      nodes.set('node_2', node2);

      const path: MissionPath = {
        startNodeId: 'node_1',
        nodes,
        totalNodes: 2,
        estimatedDuration: 45,
        difficulty: 3
      };

      expect(path.nodes.get('node_1')).toBe(node1);
      expect(path.nodes.get('node_2')).toBe(node2);
      expect(path.nodes.has('node_3')).toBe(false);
    });
  });
});
