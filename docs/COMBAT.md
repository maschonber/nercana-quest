# Combat System Documentation

## Overview

The Nercana combat system is a sophisticated turn-based combat engine designed for space exploration scenarios. It features time-based initiative ordering, intelligent AI, dynamic status effects, and support for multi-combatant encounters.

## Architecture

### Core Components

The combat system follows a modular architecture with clear separation of concerns:

```
Combat System Architecture
├── Models/
│   ├── combat.model.ts        - Core combat data structures
│   └── status-effect.model.ts - Status effect definitions
├── Services/
│   ├── combat.service.ts            - Public API facade
│   ├── combat-orchestrator.service.ts - Main combat controller
│   ├── turn-manager.service.ts       - Time-based initiative system
│   ├── combat-ai.service.ts          - Decision making engine
│   ├── action-executor.service.ts    - Action execution engine
│   ├── combat-state-manager.service.ts - State management
│   ├── status-effect-manager.service.ts - Status effect processing
│   ├── entity-converter.service.ts   - Entity conversion utilities
│   └── actions/                      - Action strategy implementations
│       ├── action.factory.ts
│       ├── combat-action.interface.ts
│       ├── attack-action.strategy.ts
│       ├── defend-action.strategy.ts
│       └── flee-action.strategy.ts
└── Components/
    └── combat-details.component.ts - Combat visualization UI
```

## Core Services

### 1. CombatService
**Purpose**: Public API facade for the combat system  
**Dependencies**: CombatOrchestrator  
**Key Methods**:
- `createTeamCombat(heroes: Hero[], monsters: Monster[]): CombatResult`

The main entry point for initiating combat encounters.

### 2. CombatOrchestrator
**Purpose**: Main combat controller that coordinates all combat operations  
**Dependencies**: TurnManager, CombatAI, CombatStateManager, ActionExecutor, EntityConverter, StatusEffectManager  
**Key Methods**:
- `createTeamCombat(heroes: Hero[], monsters: Monster[]): CombatResult`
- `simulateCombat(heroTeam: Combatant[], enemyTeam: Combatant[]): CombatResult`
- `executeCombatTurn(combat: Combat): void` (private)

Orchestrates the entire combat flow from initialization to resolution.

### 3. TurnManager
**Purpose**: Implements sophisticated time-based initiative system  
**Key Features**:
- Speed-based action timing using formula: `actionDelay = Math.max(30, 100 - speed)`
- Priority queue management for turn ordering
- Global combat time tracking (measured in "clicks")
- Dynamic turn queue updates as combatants act

**Key Methods**:
- `initializeTurnQueue(combatants: Combatant[]): void`
- `getNextActor(): Combatant | null`
- `getCurrentTime(): number`
- `reset(): void`

### 4. CombatAI
**Purpose**: Intelligent decision-making engine for all combatants  
**Dependencies**: StatusEffectManager  
**Key Features**:
- Separate logic for heroes vs monsters
- Health-based tactical decisions
- Status effect awareness
- Threat assessment and target prioritization

**Decision Factors**:
- Health percentage thresholds
- Existing status effects
- Target selection based on threat scoring
- Probabilistic decision making

### 5. ActionExecutor
**Purpose**: Executes individual combat actions and manages their effects  
**Dependencies**: ActionFactory, CombatStateManager, StatusEffectManager, TurnManager  
**Key Methods**:
- `executeTurn(turnNumber, actor, target, actionType, combat): CombatTurn`

Coordinates action execution through the strategy pattern.

### 6. CombatStateManager
**Purpose**: Manages combat state, health tracking, and combat resolution  
**Dependencies**: StatusEffectManager  
**Key Responsibilities**:
- Combat initialization and state tracking
- Health and status management
- Combat end condition detection
- Experience calculation
- Combat summary generation

### 7. StatusEffectManager
**Purpose**: Manages time-based status effects  
**Dependencies**: TurnManager  
**Key Features**:
- Time-based effect expiration (not turn-based)
- Effect application and processing
- Status effect descriptions and UI display
- Damage/healing over time processing

## Combat Flow

### Initialization Phase
1. **Entity Conversion**: Heroes and monsters are converted to combat-ready `Combatant` objects
2. **Combat State Creation**: Initial combat state is established with empty turn history
3. **Turn Queue Setup**: All combatants are added to the time-based priority queue

### Main Combat Loop
1. **Status Effect Processing**: All active status effects are processed for damage/healing
2. **Actor Selection**: Next actor is determined by the turn manager's priority queue
3. **AI Decision Making**: Combat AI determines the action for the current actor
4. **Target Selection**: AI selects the optimal target from the opposing team
5. **Action Execution**: The chosen action is executed using the strategy pattern
6. **State Updates**: Combat state is updated with results and health changes
7. **End Condition Check**: Combat is checked for victory/defeat/flee conditions

### Resolution Phase
1. **Experience Calculation**: Total experience is calculated from defeated enemies
2. **Summary Generation**: Narrative combat summary is created
3. **Result Packaging**: Final `CombatResult` is assembled and returned

## Time-Based Initiative System

### Speed Formula
```typescript
actionDelay = Math.max(30, 100 - combatant.speed)
```

- **Base Delay**: 100 time units
- **Speed Reduction**: 1:1 ratio (1 speed point = 1 time unit reduction)
- **Minimum Delay**: 30 time units (prevents instant actions)

### Turn Queue Management
The turn manager maintains a priority queue where:
- Combatants are ordered by their `nextActionTime`
- After each action, the acting combatant's next action time is calculated
- The queue is dynamically reordered to maintain proper initiative

### Time Tracking
- Global combat time is tracked in "clicks" (abstract time units)
- Status effects expire based on combat time, not turn counts
- UI displays combat progression as "Click X" instead of "Turn X"

## Status Effect System

### Effect Types
- **DEFENDING**: Reduces incoming damage by 50%
- **POISONED**: Deals damage over time
- **REGENERATING**: Provides healing over time
- **STUNNED**: Skips next action
- **EMPOWERED**: Increases damage by 30%

### Time-Based Expiration
Status effects use absolute expiration times:
```typescript
interface AppliedStatusEffect extends StatusEffect {
  appliedAt: number;    // Combat time when applied
  expiresAt: number;    // Combat time when it expires
}
```

### Default Durations
- **Defending**: 300 time units (~9 actions)
- **Poisoned**: 400 time units (~12 actions)
- **Regenerating**: 300 time units (~9 actions)
- **Stunned**: 100 time units (~3 actions)
- **Empowered**: 200 time units (~6 actions)

## AI System

### Target Selection Algorithm
The AI uses a scoring system to select optimal targets:

1. **High Priority Targets** (Score: 100+):
   - Support units (low attack, high speed)
   - Healers and utility combatants

2. **Finishing Targets** (Score: 80+):
   - Enemies below 30% health
   - Easy elimination opportunities

3. **Threat Targets** (Score: 60+):
   - High damage dealers (attack > 25)
   - Dangerous combatants

4. **Tactical Targets** (Score: 40+):
   - Medium health enemies (30-60% health)
   - Balanced threat level

### Action Decision Logic

#### Hero AI
- **Flee**: 10% chance when health ≤ 20%
- **Defend**: Health-based probability (40% at ≤30% health, 25% at ≤50% health)
- **Attack**: Default action

#### Monster AI
- **Defend**: Health-based probability (30% at ≤25% health, 15% at ≤50% health)
- **Attack**: Default action (monsters are aggressive)

## Action System (Strategy Pattern)

### Action Strategies
Each combat action is implemented as a strategy:

- **AttackActionStrategy**: Standard damage dealing
- **DefendActionStrategy**: Applies defending status effect
- **FleeActionStrategy**: Removes combatant from combat

### Action Results
All actions return a `CombatActionResult` containing:
- Damage/healing values
- Status effects applied
- Success/failure indication
- Descriptive text

## Data Models

### Core Interfaces

#### Combatant
```typescript
interface Combatant {
  id: string;                           // Unique identifier
  name: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;                        // Determines action frequency
  type: CombatantType;                  // HERO or MONSTER
  isAlive: boolean;
  hasFled: boolean;
  statusEffects: AppliedStatusEffect[]; // Active status effects
}
```

#### CombatTurn
```typescript
interface CombatTurn {
  turnNumber: number;
  combatTime: number;                   // Time when turn occurred
  actorId: string;
  action: CombatAction;
  actorHealthAfter: number;
  targetHealthAfter: number;
  allCombatantsHealth: CombatantHealthState[]; // Complete health snapshot
  heroHealthAfter: number;              // Legacy field
  monsterHealthAfter: number;           // Legacy field
}
```

#### CombatResult
```typescript
interface CombatResult {
  outcome: CombatOutcome;               // HERO_VICTORY, HERO_DEFEAT, HERO_FLED
  turns: CombatTurn[];                  // Complete turn history
  experienceGained: number;             // Total XP from defeated enemies
  summary: string;                      // Narrative description
}
```

## Integration Points

### Quest System Integration
- Combat is initiated through `QuestDomainService`
- Results are logged to the quest system
- Experience and resources are awarded based on combat outcomes

### Hero System Integration
- Heroes are converted to combatants via `EntityConverter`
- Hero stats directly influence combat performance
- Experience gained updates hero progression

### Monster System Integration
- Monsters are generated by `MonsterService`
- Multi-monster encounters support species groupings
- Monster difficulty scales with hero progression

## Performance Considerations

### Combat Simulation
- Entire combat is simulated instantly (no real-time delays)
- Results are logged for UI display
- Maximum combat length is naturally limited by damage/health ratios

### Memory Management
- Turn history is maintained for UI display
- Status effects are cleaned up when expired
- Combat state is reset between encounters

## Testing Strategy

### Unit Tests
- Individual service testing with mocked dependencies
- Action strategy testing
- Status effect manager testing

### Integration Tests
- Time-based status effect duration testing
- Multi-combatant scenario validation
- UI display integration testing

## Configuration

### Damage Formulas
```typescript
// Base damage calculation
const baseDamage = Math.max(1, actor.attack - target.defense);

// Status effect modifiers
const empoweredBonus = hasEmpowered ? baseDamage * 0.3 : 0;
const defendingReduction = targetDefending ? finalDamage * 0.5 : 0;
```

### Speed Balance
- Speed values typically range from 5-30
- Higher speed = more frequent actions
- Diminishing returns at very high speeds due to minimum delay

## Future Enhancements

### Potential Improvements
1. **Equipment System**: Weapons and armor affecting combat stats
2. **Special Abilities**: Unique combatant abilities beyond basic actions
3. **Environmental Effects**: Terrain or situational modifiers

### Scalability Considerations
- Current system supports unlimited combatants per side
- Performance scales linearly with combatant count
- Memory usage is proportional to combat length and participant count

---

*This documentation reflects the current state of the combat system as of the latest refactoring to implement time-based status effects and click-based time display.*
