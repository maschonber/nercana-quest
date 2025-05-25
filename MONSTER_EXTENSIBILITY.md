# Monster Configuration Extensibility Guide

## Overview

The Nercana quest system now uses a **type-safe TypeScript configuration** for monster data instead of JSON files. This approach provides both data separation AND compile-time type safety.

## Architecture Benefits

### ✅ **Type Safety**
- **Compile-time validation**: TypeScript ensures all monster types and tiers are properly defined
- **IntelliSense support**: Full autocomplete and type checking in IDEs
- **Runtime safety**: Impossible to reference non-existent monster types or properties

### ✅ **Data Separation**
- Configuration data is separated from business logic
- Easy to modify monster stats without touching service code
- Clear separation of concerns

### ✅ **Maintainability**
- Adding new monsters requires updating both enum and configuration
- TypeScript compiler will catch missing configurations
- Refactoring is safe with IDE support

## File Structure

```
src/
├── assets/data/
│   └── monster-config.ts          # Type-safe configuration
├── app/features/quest/models/
│   ├── monster.model.ts           # Enums and interfaces
│   └── monster-data.model.ts      # Configuration interfaces
└── app/features/quest/services/
    └── monster.service.ts         # Business logic
```

## Adding New Monsters

### 1. Update the Monster Type Enum
```typescript
// src/app/features/quest/models/monster.model.ts
export enum MonsterType {
  GOBLIN = 'goblin',
  TROLL = 'troll',
  // Add new monster type
  OCELOT = 'ocelot'
}
```

### 2. Add Configuration Data
```typescript
// src/assets/data/monster-config.ts
const MONSTERS: Record<MonsterType, MonsterData> = {
  [MonsterType.GOBLIN]: { /* existing config */ },
  [MonsterType.TROLL]: { /* existing config */ },
  // Add new monster configuration
  [MonsterType.OCELOT]: {
    baseHealth: 35,
    baseAttack: 14,
    baseDefense: 7,
    baseExpReward: 22,
    baseGoldReward: 12,
    name: 'Wild Ocelot',
    description: 'A sleek and agile wild cat with sharp claws.'
  }
} as const;
```

### 3. Compilation Validates Everything
If you forget to add the configuration, TypeScript will show a compilation error:
```
Property 'ocelot' is missing in type '{ goblin: MonsterData; troll: MonsterData; }' 
but required in type 'Record<MonsterType, MonsterData>'
```

## Adding New Tiers

### 1. Update the Tier Enum
```typescript
export enum MonsterTier {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  BOSS = 'boss',
  // Add new tier
  LEGENDARY = 'legendary'
}
```

### 2. Add Tier Configuration
```typescript
const TIERS: Record<MonsterTier, TierData> = {
  [MonsterTier.EASY]: { /* existing */ },
  [MonsterTier.MEDIUM]: { /* existing */ },
  [MonsterTier.HARD]: { /* existing */ },
  [MonsterTier.BOSS]: { /* existing */ },
  // Add new tier
  [MonsterTier.LEGENDARY]: {
    multiplier: 5.0,
    prefix: 'Legendary '
  }
} as const;
```

## Configuration Interface

```typescript
interface MonsterData {
  readonly baseHealth: number;
  readonly baseAttack: number;
  readonly baseDefense: number;
  readonly baseExpReward: number;
  readonly baseGoldReward: number;
  readonly name: string;
  readonly description: string;
}

interface TierData {
  readonly multiplier: number;
  readonly prefix: string;
}
```

## Usage in Services

```typescript
import { MONSTER_CONFIG } from '../../../assets/data/monster-config';

// Type-safe access to monster data
const goblinData = MONSTER_CONFIG.monsters[MonsterType.GOBLIN];
const easyTier = MONSTER_CONFIG.tiers[MonsterTier.EASY];
```

## Key Advantages Over JSON

| Aspect | JSON Approach | TypeScript Approach |
|--------|---------------|-------------------|
| **Type Safety** | ❌ Runtime only | ✅ Compile-time + Runtime |
| **IDE Support** | ❌ Limited | ✅ Full IntelliSense |
| **Refactoring** | ❌ Manual, error-prone | ✅ Safe, automated |
| **Data Separation** | ✅ Yes | ✅ Yes |
| **Error Detection** | ❌ Runtime only | ✅ Build time |
| **Maintainability** | ❌ Lower | ✅ Higher |

## Migration Notes

- Removed `resolveJsonModule` from `tsconfig.json`
- Deleted `monsters.json` file
- Updated all imports to use TypeScript configuration
- Enhanced tests to use proper enum values
- All existing functionality preserved with improved type safety

This approach provides the best of both worlds: clean data separation with robust type safety that prevents runtime errors and improves developer experience.
