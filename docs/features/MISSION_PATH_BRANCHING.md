# Mission Path Architecture - Real Branching Implementation Plan

## Current Problem Analysis

The current path generation creates "fake branching" where:
- All nodes are generated linearly in an array
- Choices only connect to consecutive nodes in the array
- No true alternative paths exist
- No convergence points are created
- Path complexity is cosmetic rather than structural

## Goals (Updated Based on Requirements)

1. **Real Branching**: Create genuine alternative paths that lead to different experiences
2. **Single Extraction**: All paths converge at a single extraction point (no mid-path convergence)
3. **Player Choice**: Enable strategic decisions (e.g., avoiding combat when wounded)
4. **Maintainable**: Keep the architecture simple enough to understand and debug
5. **Unpredictable**: Avoid rigid patterns that become predictable over time
6. **Validated**: Ensure all paths are completable and lead to extraction

## Simplified Architecture (Dynamic Path Building)

### Core Concept: Tree Structure with Single Extraction

Instead of rigid patterns, use a **dynamic tree-building approach**:
- Start with landing site
- For each node, decide if it should branch (probabilistic)
- If branching, create 2-3 alternative paths
- All branches eventually lead to the single extraction point
- No mid-path convergence (simpler logic)

### Path Generation Algorithm

```typescript
interface PathNode {
  id: string;
  type: MissionNodeType;
  depth: number; // distance from start
  choices: PathChoice[]; // 0-3 outgoing connections
}

interface PathChoice {
  id: string;
  targetNodeId: string;
  label: string; // "Stealth Route", "Direct Assault", etc.
  previewHint: string; // What player can see about target node
}
```

### Dynamic Generation Process

1. **Start**: Create landing site at depth 0
2. **Growth Phase**: For each new node, probabilistically decide:
   - Continue linear (1 choice)
   - Create branch (2-3 choices leading to different nodes)
3. **Depth Management**: Track maximum depth to ensure reasonable mission length
4. **Extraction Phase**: When target depth reached, all "leaf" nodes connect to single extraction

### Branching Probability Logic

```typescript
// Simple probability based on current depth and mission parameters
shouldBranch(currentDepth: number, maxDepth: number, branchesCreated: number): boolean {
  // More likely to branch in middle portion of mission
  const depthFactor = currentDepth > 1 && currentDepth < maxDepth - 2;
  
  // Limit total branches to avoid overwhelming complexity
  const branchLimit = branchesCreated < 3;
  
  // Base probability around 30-40%
  return depthFactor && branchLimit && this.randomService.rollDice(0.35);
}
```

## Design Decisions (Confirmed)

### 1. Convergence Behavior ✅
- **Single extraction point for all missions**
- **No mid-path convergence** (branches don't merge back together)
- Simpler tree structure: branches only diverge, never reconverge

### 2. Branch Content Strategy ✅
- **Primary purpose: Player choice and strategic options**
- **Preview next node** so players can make informed decisions
- **Avoid complex encounters when wounded** or choose preferred playstyle
- **Random variation** sufficient for meaningful stories (no complex risk/reward)

### 3. Complexity Scaling ✅
- **Remove difficulty-based complexity scaling**
- **Same branching logic for all mission difficulties**
- Simplifies implementation and reduces predictability

### 4. Choice Meaningfulness ✅
- **Maximum 3 choices per node**
- **Focus on player agency** rather than mechanical optimization
- **Preview information** enables strategic decision-making

### 5. Path Predictability ✅
- **Avoid rigid pattern templates**
- **Dynamic, probabilistic generation** keeps missions fresh
- **Tree structure** with variable branching points

## Implementation Steps

### Step 1: Add Tree Structure Support
- Modify MissionPath model to support tree structure instead of linear array
- Add depth tracking and parent-child relationships
- Keep existing node generators unchanged

### Step 2: Dynamic Path Builder
- Replace linear generation with tree-building algorithm
- Implement probabilistic branching logic
- Ensure all leaf nodes connect to single extraction

### Choice Preview System (Simplified)
- **No separate preview data needed** - access target node directly during execution
- Generate meaningful choice labels based on target node type and content
- Mission execution code can read target node properties for preview display
- Eliminates data duplication and keeps model lean

### Step 4: Enhanced Validation
- Validate all paths lead to extraction
- Check for orphaned nodes
- Ensure reasonable mission length and branching

## Benefits of This Simplified Approach

1. **Flexible & Unpredictable**: No rigid patterns, each mission unique
2. **Player-Focused**: Choices matter for strategy, not just variety
3. **Simple Implementation**: Tree building is straightforward
4. **Easy Debugging**: Tree structure is intuitive to visualize
5. **Scalable**: Can easily adjust branching probability and depth limits

## Implementation Details

### Modified MissionPath Structure
```typescript
interface MissionPath {
  startNodeId: string;
  extractionNodeId: string; // Single extraction point
  nodes: Map<string, MissionNode>;
  totalNodes: number;
  maxDepth: number; // Longest path from start to extraction
  branchCount: number; // Total branching points
}

interface MissionNode {
  // ...existing fields...
  depth: number; // Distance from start
  parentNodeId?: string; // For tree traversal
  isLeafNode: boolean; // True if leads directly to extraction
}
```

### Choice Labels (Generated from Target Node)
```typescript
interface MissionChoice {
  id: string;
  label: string; // Generated from target node: "Investigate Mining Site", "Bypass Encounter"
  description: string; // Generated from target node content
  targetNodeId: string;
  riskLevel: RiskLevel; // Derived from target node type and content
}

// During mission execution, preview info comes from:
// const targetNode = missionPath.nodes.get(choice.targetNodeId);
// Display: targetNode.title, targetNode.type, targetNode.content.enemyTypes, etc.
```

## Risk Mitigation

1. **Complexity Creep**: Single tree structure keeps implementation focused
2. **Performance**: Tree building is lightweight, no complex graph algorithms needed
3. **Validation**: Simple tree traversal for validation
4. **UI Integration**: Preview system enhances existing choice mechanism
5. **Debugging**: Tree structure is easy to visualize and understand

---

**Ready for Implementation**: The simplified dynamic tree approach provides meaningful branching without architectural complexity. Players get strategic choice through previews, and each mission remains unique through probabilistic generation.
