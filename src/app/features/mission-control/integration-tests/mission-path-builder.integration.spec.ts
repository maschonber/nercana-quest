import { TestBed } from '@angular/core/testing';
import { MissionPathFactory } from '../services/mission-path-factory.service';
import {
  MissionOutline,
  MissionType,
  MissionStatus
} from '../models/mission-outline.model';
import {
  MissionPath,
  MissionTheme,
  PathComplexity,
  MissionNodeType
} from '../models/mission-path.model';
import { RandomService, TestRandomProvider } from '../../../shared';
import { EncounterNodeGenerator } from '../services/node-generators/encounter-node-generator.service';
import { ExtractionNodeGenerator } from '../services/node-generators/extraction-node-generator.service';
import { LandingSiteGenerator } from '../services/node-generators/landing-site-generator.service';
import { MiningNodeGenerator } from '../services/node-generators/mining-node-generator.service';
import { RestNodeGenerator } from '../services/node-generators/rest-node-generator.service';
import { TreasureNodeGenerator } from '../services/node-generators/treasure-node-generator.service';
import { DecisionNodeGenerator } from '../services/node-generators/decision-node-generator.service';

describe('Mission Path Builder Integration Tests', () => {
  let missionPathFactory: MissionPathFactory;
  let testRandomProvider: TestRandomProvider;

  // Mock outline for testing
  const testMissionOutline: MissionOutline = {
    id: 'test-mission-1',
    title: 'Test Mission',
    briefDescription: 'A test mission for integration testing',
    detailedDescription:
      'This is a detailed test mission description for integration testing',
    imageUrl: 'assets/mission/placeholder.png',
    travelTime: 30,
    challengeRating: 3,
    missionType: MissionType.EXPLORATION,
    status: MissionStatus.AVAILABLE,
    discoveredAt: new Date(),
    theme: MissionTheme.PLANET,
    pathComplexity: PathComplexity.BRANCHING
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TestRandomProvider,
        { provide: RandomService, useFactory: (provider: TestRandomProvider) => provider, deps: [TestRandomProvider] },
        MissionPathFactory,
        LandingSiteGenerator,
        EncounterNodeGenerator,
        TreasureNodeGenerator,
        MiningNodeGenerator,
        RestNodeGenerator,
        ExtractionNodeGenerator,
        DecisionNodeGenerator
      ]
    });

    testRandomProvider = TestBed.inject(TestRandomProvider);
    missionPathFactory = TestBed.inject(MissionPathFactory);
    
    // Set up deterministic random values for consistent tests
    testRandomProvider.setSequence([0.5, 0.5, 0.5, 0.5, 0.5]); // Base random values
    testRandomProvider.enableFallback(); // Allow fallback to Math.random() when needed
  });

  it('should create a valid mission path from an outline', () => {
    // Reset and set deterministic values
    testRandomProvider.useRealRandom();
    testRandomProvider.setSequence(Array(50).fill(0.5));
    testRandomProvider.enableFallback(); // Allow fallback for any additional calls
    
    // Act
    const missionPath = missionPathFactory.createPath(testMissionOutline);

    // Assert
    expect(missionPath).toBeDefined();
    expect(missionPath.nodes.size).toBeGreaterThan(0);
    expect(missionPath.startNodeId).toBe('node_1');
    expect(missionPath.extractionNodeId).toBe('extraction');
    
    // Basic structure validation
    const startNode = missionPath.nodes.get(missionPath.startNodeId);
    expect(startNode).toBeDefined();
    expect(startNode?.type).toBe(MissionNodeType.LANDING_SITE);
    
    const extractionNode = missionPath.nodes.get(missionPath.extractionNodeId);
    expect(extractionNode).toBeDefined();
    expect(extractionNode?.type).toBe(MissionNodeType.EXTRACTION);
  });

  it('should generate choices connecting all nodes', () => {
    // Reset random provider for this test
    testRandomProvider.useRealRandom();
    testRandomProvider.setSequence(Array(50).fill(0.5));
    testRandomProvider.enableFallback();
    
    // Act
    const missionPath = missionPathFactory.createPath(testMissionOutline);

    // Assert
    // Every node except extraction should have choices
    for (const [nodeId, node] of missionPath.nodes.entries()) {
      if (node.type === MissionNodeType.EXTRACTION) {
        expect(node.choices.length).toBe(0);
      } else {
        expect(node.choices.length).toBeGreaterThan(0);
      }
    }
  });

  it('should create a mission path with the correct structure', () => {
    // Reset and set deterministic values
    testRandomProvider.useRealRandom();
    testRandomProvider.setSequence(Array(50).fill(0.5));
    testRandomProvider.enableFallback();
    
    // Act
    const missionPath = missionPathFactory.createPath(testMissionOutline);
    
    // Assert
    // Verify the structure has the expected elements
    expect(missionPath.nodes.size).toBeGreaterThan(3); // At least start, some content, and extraction
    
    // Verify we have a variety of node types
    const nodeTypes = new Set<MissionNodeType>();
    for (const node of missionPath.nodes.values()) {
      nodeTypes.add(node.type);
    }
    
    // Should at least have LANDING_SITE and EXTRACTION, plus some content nodes
    expect(nodeTypes.size).toBeGreaterThan(2);
    expect(nodeTypes.has(MissionNodeType.LANDING_SITE)).toBe(true);
    expect(nodeTypes.has(MissionNodeType.EXTRACTION)).toBe(true);
  });

  it('should validate path is fully connected', () => {
    // Configure for a simpler path for validation testing
    testRandomProvider.useRealRandom(); // Reset first
    testRandomProvider.setSequence(Array(50).fill(0.5));
    testRandomProvider.enableFallback();
    
    // Act
    const missionPath = missionPathFactory.createPath(testMissionOutline);

    // Assert
    const isValid = missionPathFactory.validateMissionPath(missionPath);
    expect(isValid).toBe(true);

    // Every node should be reachable from the start node
    // Perform a depth-first search from the start node
    const visited = new Set<string>();
    const toVisit = [missionPath.startNodeId];

    while (toVisit.length > 0) {
      const nodeId = toVisit.pop()!;
      visited.add(nodeId);

      const node = missionPath.nodes.get(nodeId);
      expect(node).toBeDefined();

      // Add unvisited children to the stack
      for (const choice of node!.choices) {
        if (!visited.has(choice.targetNodeId)) {
          toVisit.push(choice.targetNodeId);
        }
      }
    }

    // All nodes should have been visited
    expect(visited.size).toBe(missionPath.nodes.size);
  });
});
