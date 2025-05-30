# Status Effects Tooltip Fix - Validation Summary

## Issue Fixed
Fixed status effects tooltips to show remaining clicks at the combat time of the log entry instead of the initial number of clicks when applied.

## Changes Made

### 1. HTML Template Update (COMPLETED)
- Updated `combat-details.component.html` to pass `turn.combatTime` parameter to `getStatusEffectTooltip()` calls
- Applied to both hero status effects (line ~127) and enemy status effects (line ~155)
- **Before**: `getStatusEffectTooltip(effect)`
- **After**: `getStatusEffectTooltip(effect, turn.combatTime)`

### 2. Test Updates (COMPLETED)
- Updated `combat-details-status-effects.integration.spec.ts` to provide the required `currentCombatTime` parameter
- Updated test expectations to reflect remaining duration instead of original duration
- **Test scenario**: At combat time 50:
  - Defending effect (expires at 200): Expected "150 clicks remaining" 
  - Poisoned effect (expires at 300): Expected "250 clicks remaining"

## Implementation Details

### Current Method Signature
```typescript
getStatusEffectTooltip(statusEffect: AppliedStatusEffect, currentCombatTime: number): string {
  // Calculate remaining duration at the current combat time
  const remainingDuration = statusEffect.expiresAt - currentCombatTime;
  const durationText = remainingDuration > 0 ? 
    ` (${remainingDuration} clicks remaining)` : 
    ' (expired)';
  return `${statusEffect.name}${durationText}: ${statusEffect.description}`;
}
```

### HTML Template Usage
```html
<!-- Hero status effects -->
<span 
  class="status-effect" 
  [title]="getStatusEffectTooltip(effect, turn.combatTime)">
  {{getStatusEffectIcon(effect)}}
</span>

<!-- Enemy status effects -->
<span 
  class="status-effect" 
  [title]="getStatusEffectTooltip(effect, turn.combatTime)">
  {{getStatusEffectIcon(effect)}}
</span>
```

## Validation Results
- ✅ All tests pass (137/137)
- ✅ Application builds successfully
- ✅ Status effects tooltips now show context-accurate remaining duration
- ✅ Implementation handles both active and expired status effects

## User Impact
- **Before**: Tooltips showed initial duration (e.g., "200 clicks duration") regardless of when in combat the log entry was from
- **After**: Tooltips show accurate remaining time for that specific combat moment (e.g., "150 clicks remaining" at combat time 50)
- **Edge case**: Expired effects show "(expired)" instead of negative values

## Technical Notes
- The method already had the logic for calculating remaining time, only needed the template to pass the combat time parameter
- Tests were updated to expect remaining duration instead of original duration
- No breaking changes to the component interface - method signature was already correct
