# Mission Generation Feature Specification

## Overview

The Mission Generation feature extends the existing Mission Control system to create procedurally generated mission paths, transforming missions from simple templates into complex, tree-like adventure structures. This system generates branching paths with multiple types of nodes (encounter, treasure, mining, rest) that create meaningful choices and consequences for clone deployment.

## Architecture

### Enhanced Mission Generation Architecture
- **Mission Paths**: Tree-like data structures with branching decision points
- **Mission Nodes**: Typed nodes representing different encounters and opportunities
- **Procedural Generation**: Dynamic path creation based on mission type and theme
- **Pre-resolved Content**: Encounters, resources, and prerequisites determined during generation
- **Strategic Planning**: Visible mission structure allows informed deployment decisions

## Feature Requirements

### 1. Mission Path Data Structure

**Core mission path components:**

#### Mission Path Interface
```typescript
interface MissionPath {
  startNodeId: string; // ID of the landing site node
  nodes: Map<string, MissionNode>; // All nodes indexed by ID for easy lookup
  totalNodes: number;
  estimatedDuration: number; // Based on path complexity
  difficulty: number; // Use existing challengeRating scale
}

interface MissionNode {
  id: string;
  type: MissionNodeType;
  title: string;
  description: string;
  choices: MissionChoice[]; // 0-2 choices for branching (links to next nodes)
  requirements?: NodeRequirement[]; // Prerequisites to access this node
  rewards?: NodeReward[]; // What can be gained from this node
  content?: NodeContent; // Type-specific content (encounters, resources, etc.)
}

enum MissionNodeType {
  LANDING_SITE = 'landing_site',    // Always first node
  ENCOUNTER = 'encounter',          // Combat encounters
  TREASURE = 'treasure',            // Resource discoveries
  MINING = 'mining',               // Resource extraction sites
  REST = 'rest',                   // Recovery and preparation
  DECISION = 'decision',           // Story branching points
  EXTRACTION = 'extraction'        // Mission completion, always last node
}

interface MissionChoice {
  id: string;
  label: string;
  description: string;
  targetNodeId: string; // Links to the next node, creating forward connections
  riskLevel: RiskLevel;
  skillCheck?: SkillCheck; // Future: skill requirements
}

enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high'
}
```

#### Mission Theme Integration
```typescript
enum MissionTheme {
  PLANET = 'planet',        // Planetary surface exploration
  STATION = 'station',      // Abandoned/active station infiltration
  ASTEROID = 'asteroid',    // Asteroid belt mining/exploration
  DERELICT = 'derelict',    // Abandoned ship investigation
  NEBULA = 'nebula'         // Hazardous space phenomena
}

// Additional types for node content
interface NodeRequirement {
  type: string; // e.g., 'skill', 'equipment', 'health'
  value: string | number;
}

interface NodeReward {
  type: string; // e.g., 'goo', 'metal', 'energy', 'experience'
  quantity: number;
  probability: number; // 0-1, chance of getting this reward
}

interface NodeContent {
  // Type-specific content will be defined based on node type
  // For encounters: Monster[] or encounter configuration
  // For treasure/mining: Resource definitions
  // For rest: Recovery options
  [key: string]: any;
}
```

### 2. Node Type Specifications

#### Landing Site Node
- **Purpose**: Starting point for all missions
- **Content**: Basic mission briefing, initial equipment checks
- **Choices**: 1-2 initial paths based on mission complexity
- **Requirements**: None (always accessible)

#### Encounter Node
- **Purpose**: Combat encounters with pre-generated enemies
- **Content**: 
  - Pre-resolved monster selections (using existing MonsterService)
  - Encounter difficulty based on mission challenge rating
- **Choices**: Post-combat paths (retreat, advance, explore)
- **Requirements**: May require surviving previous encounters

#### Treasure Node
- **Purpose**: Resource discovery opportunities
- **Content**:
  - Resource type and quantity ranges
  - Skill checks for optimal resource extraction
  - Hidden/bonus treasures with higher requirements
- **Choices**: Continue exploration or secure findings
- **Requirements**: May require specific equipment or skills

#### Mining Node
- **Purpose**: Active resource extraction sites
- **Content**:
  - Mineral types available for extraction
  - Extraction difficulty and time requirements
  - Equipment wear and resource yield calculations
- **Choices**: Deep mining (risky) vs. surface extraction (safe)
- **Requirements**: Mining equipment, energy reserves

#### Rest Node
- **Purpose**: Recovery and preparation points
- **Content**:
  - Health recovery opportunities
  - Equipment maintenance and repair
  - Strategic planning and intel gathering
- **Choices**: Short rest vs. extended preparation
- **Requirements**: Safe location, time availability

### 3. Mission Generation Service Enhancement

#### Enhanced Mission Service
```typescript
interface MissionService {
  generateMissionOutline(): MissionOutline; // Existing method
  generateMissionPath(outline: MissionOutline): MissionPath; // New method
  validateMissionPath(path: MissionPath): boolean;
}
```

#### Path Generation Algorithm
1. **Theme Selection**: Choose mission theme based on mission type
2. **Path Structure**: Generate node count and branching factor based on complexity
3. **Node Network Creation**: Create connected nodes with forward links via `targetNodeId` in choices
4. **Content Resolution**: Populate nodes with encounters, resources, and requirements
5. **Validation**: Ensure all nodes are reachable and paths lead to extraction node

### 4. Mission Outline Model Extension

```typescript
interface MissionOutline {
  // Existing fields
  id: string;
  title: string;
  briefDescription: string;
  detailedDescription: string;
  imageUrl: string;
  travelTime: number;
  challengeRating: number;
  missionType: MissionType;
  status: MissionStatus;
  discoveredAt: Date;
    // New fields
  missionPath?: MissionPath;        // Generated mission path
  theme: MissionTheme;              // Mission environment theme
  pathComplexity: PathComplexity;   // Simple, moderate, complex
}

enum PathComplexity {
  LINEAR = 'linear',           // 3-5 nodes, minimal branching
  BRANCHING = 'branching',     // 5-8 nodes, moderate choices
  COMPLEX = 'complex'          // 8-12 nodes, multiple paths
}
```

### 5. Resource and Encounter Pre-Resolution

#### Resource Pre-Generation
- **Resource Types**: Use existing station resource system (goo, metal, energy)
- **Quantity Calculation**: Based on mission difficulty and node type
- **Simple Probability**: Basic chance calculations for resource extraction success

#### Encounter Pre-Resolution
- **Monster Selection**: Leverage existing MonsterService for appropriate enemies
- **Encounter Scaling**: Match monster difficulty to mission challenge rating
- **Theme-Specific Encounters**: Different monster types based on mission theme

## Technical Implementation Plan

### Phase 1: Core Path Infrastructure
1. **Mission Path Models**
   - `mission-control/models/mission-path.model.ts`
   - `mission-control/models/mission-node.model.ts`
   - Extension of existing mission-outline.model.ts

2. **Path Generation Service**
   - Enhanced MissionService with path generation capability
   - Simple theme-based node generation
   - Basic validation logic

3. **Validation and Testing**
   - Path structure validation logic
   - Unit tests for generation algorithms
   - Integration tests with existing mission system

### Phase 2: Content Generation Integration
1. **Encounter Integration**
   - Integration with existing MonsterService
   - Combat difficulty scaling algorithms

2. **Resource System Integration**
   - Resource type and quantity generation
   - Skill check probability calculations
   - Reward balancing and validation

3. **Theme System**
   - Theme-specific content generation
   - Narrative element selection
   - Environmental description generation

### Phase 3: UI Integration and Preview
1. **Mission Path Visualization**
   - Minimal changes to existing mission details UI
   - Risk/reward visualization indicators
   - Estimated rewards and risks display

## Design Patterns and Architecture

### Recommended Design Patterns

#### 1. Strategy Pattern for Node Generation
```typescript
interface NodeGeneratorStrategy {
  generateNode(theme: MissionTheme, difficulty: number): MissionNode;
}

class EncounterNodeGenerator implements NodeGeneratorStrategy {
  // Encounter-specific generation logic
}

class TreasureNodeGenerator implements NodeGeneratorStrategy {
  // Treasure-specific generation logic
}
```

#### 2. Factory Pattern for Path Creation
```typescript
class MissionPathFactory {
  createPath(outline: MissionOutline): MissionPath {
    const theme = this.determineTheme(outline);
    const complexity = this.determineComplexity(outline);
    return this.buildPath(theme, complexity, outline);
  }
}
```

### Architectural Considerations

#### 1. Separation of Concerns
- **Path Generation**: Pure business logic, no UI dependencies
- **Content Resolution**: Separate services for encounters, resources, themes
- **Validation**: Independent validation services with clear interfaces

#### 2. Extensibility
- **Plugin Architecture**: Easy addition of new node types
- **Theme System**: Configurable theme parameters and generation rules
- **Content Providers**: Swappable content generation services

## Questions and Design Considerations

### Critical Design Questions

1. **Path Complexity Distribution**: What percentage of missions should be linear vs. branching vs. complex?
   - *Recommendation*: 40% linear, 45% branching, 15% complex based on mission difficulty

2. **Pre-Resolution Granularity**: How detailed should encounter and resource pre-generation be?
   - *Recommendation*: Generate specific monsters and resource types, but keep rewards simple

3. **Path Regeneration**: Should paths be fixed once generated for a mission outline?
   - *Recommendation*: Yes, paths should be deterministic for each mission outline

4. **Theme Influence**: How strongly should mission theme affect path structure and content?
   - *Recommendation*: High influence on aesthetics and encounter types, moderate influence on structure

5. **Skill System Integration**: How should future skill systems integrate with node requirements?
   - *Recommendation*: Later feature, but design nodes with extensible requirement fields for skills (unused for now)

### Technical Concerns

1. **State Management**: How to integrate mission paths with existing mission store?
   - *Solution*: Extend MissionStore to handle path data as part of mission outlines

4. **Backward Compatibility**: How to maintain compatibility with existing mission system?
   - *Solution*: No backward compatibility needed - this is a new feature for future missions

## Success Criteria

### Core Functionality
- Generate tree-like mission paths with branching choices
- Pre-resolve encounters using existing monster system
- Pre-determine resource opportunities and requirements
- Support multiple mission themes with appropriate content

### Integration Quality
- Seamless integration with existing mission control system
- Consistent data models and service interfaces
- Proper error handling and validation

### User Experience
- Clear mission path visualization and navigation
- Meaningful choice previews and risk assessment
- Appropriate difficulty scaling and reward balance
- Coherent thematic presentation and narrative flow

### Technical Excellence
- Modular, extensible architecture with clear separation of concerns
- Comprehensive test coverage
- Clean integration points for future feature expansion

## Conclusion

The Mission Generation feature transforms the mission control system from a simple scanning interface into a strategic planning environment where players can evaluate complex mission structures before deployment. By pre-resolving encounters and resources while maintaining branching paths, the system provides meaningful choices without requiring full quest execution simulation.

The modular architecture using strategy and factory patterns ensures extensibility for future enhancements while maintaining clean integration with existing systems. The theme-based generation system provides variety and replayability while the pre-resolution approach enables informed decision-making.
