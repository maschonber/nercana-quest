# Nercana Architecture Improvement Plan

## Critical Issues to Address

### 1. Store Architecture Consolidation
**Current Problem**: Mixed monolithic and feature-based stores
**Solution**: Migrate to pure feature-based store architecture

#### Implementation Steps:
1. **Move Quest Logic**: Move quest business logic from `QuestStore` to `QuestFacadeService`
2. **Hero State Ownership**: Transfer hero state to `HeroStore` completely  
3. **Log State Separation**: Keep quest logs in `QuestStore`, hero progress in `HeroStore`
4. **Remove Monolithic Store**: Delete shared/services/quest.store.ts after migration

```typescript
// Target Architecture:
src/app/shared/stores/
├── hero.store.ts        # Hero state only
├── quest.store.ts       # Quest progress/logs only  
├── log.store.ts         # Game-wide logs
└── theme.store.ts       # UI theme state

src/app/features/*/services/
├── *-facade.service.ts  # Orchestrates multiple stores
└── *-domain.service.ts  # Pure business logic
```

### 2. Error Handling & Loading States
**Current Problem**: No error handling or loading indicators
**Solution**: Add comprehensive error handling

#### Implementation:
```typescript
// Add to store interfaces
interface QuestState {
  isLoading: boolean;
  error: string | null;
  // ... existing state
}

// Add error handling methods
withMethods((store) => ({
  setLoading(loading: boolean) {
    patchState(store, { isLoading: loading });
  },
  setError(error: string | null) {
    patchState(store, { error, isLoading: false });
  },
  clearError() {
    patchState(store, { error: null });
  }
}))
```

### 3. Service Layer Improvements
**Current Problem**: Domain services mixed with infrastructure concerns
**Solution**: Clean separation between domain and infrastructure

#### Target Service Architecture:
```
Domain Layer (Pure business logic):
├── hero-domain.service.ts     # Hero calculations, level-ups
├── quest-domain.service.ts    # Quest generation, outcomes
├── combat-domain.service.ts   # Combat mechanics
└── monster-domain.service.ts  # Monster generation

Infrastructure Layer (Side effects):
├── quest-facade.service.ts    # Orchestrates stores + domain services  
├── hero-facade.service.ts     # Manages hero state transitions
└── persistence.service.ts     # Save/load game state (future)
```

## Performance Optimizations

### 1. Computed Signal Optimization
**Issue**: Some computed values may recalculate unnecessarily
**Solution**: Optimize computed signal dependencies

```typescript
// Before: May recalculate on any hero change
heroPower = computed(() => this.hero().attack + this.hero().defense);

// After: More specific dependencies
heroPower = computed(() => {
  const hero = this.hero();
  return hero.attack + hero.defense;
});
```

### 2. Component Communication
**Issue**: Event emission chains for quest actions
**Solution**: Direct facade injection in all components

```typescript
// Current: AppComponent -> HeroDetailsComponent -> embarkOnQuest event
// Target: HeroDetailsComponent directly calls questFacade.embarkOnQuest()
```

## Feature Enhancements

### 1. Data Persistence
**Priority**: High - Currently no save/load functionality
**Implementation**: Add browser storage service

```typescript
@Injectable({providedIn: 'root'})
export class GamePersistenceService {
  saveGame(gameState: GameState): void {
    localStorage.setItem('nercana-save', JSON.stringify(gameState));
  }
  
  loadGame(): GameState | null {
    const saved = localStorage.getItem('nercana-save');
    return saved ? JSON.parse(saved) : null;
  }
}
```

### 2. Combat System Enhancement
**Priority**: Medium - Currently simple RNG-based
**Implementation**: Add tactical combat with stat interactions

### 3. Equipment System
**Priority**: Low - Extends progression mechanics
**Implementation**: Add items that modify hero stats

## Testing Improvements

### 1. Integration Tests
**Missing**: Cross-feature integration testing
**Solution**: Add tests for quest -> hero stat updates

### 2. E2E Quest Flow
**Missing**: End-to-end quest completion flow
**Solution**: Playwright tests for complete user journeys

### 3. Performance Testing
**Missing**: Large dataset performance tests  
**Solution**: Test with 1000+ log entries

## Code Quality Enhancements

### 1. TypeScript Strictness
**Current**: Some implicit any types
**Solution**: Enable strict mode, explicit return types

### 2. Documentation
**Missing**: Inline code documentation
**Solution**: Add JSDoc comments for all public APIs

### 3. Bundle Optimization
**Future**: Code splitting for feature modules
**Solution**: Lazy-load quest/hero features

## Implementation Priority

### Phase 1 (Week 1):
1. ✅ Store architecture consolidation  
2. ✅ Error handling implementation
3. ✅ Component communication optimization

### Phase 2 (Week 2):
1. Data persistence service
2. Enhanced combat mechanics
3. Integration test suite

### Phase 3 (Future):
1. Equipment system
2. Performance optimizations
3. Advanced features (multiplayer, achievements)

---

## Next Immediate Steps

1. **Consolidate Stores**: Remove monolithic QuestStore, distribute responsibilities
2. **Add Error Handling**: Implement loading states and error boundaries
3. **Enhance Testing**: Add integration tests for cross-feature interactions
4. **Performance Audit**: Profile signal computation performance
5. **Data Persistence**: Implement save/load functionality

This plan maintains current functionality while significantly improving maintainability, testability, and performance.
