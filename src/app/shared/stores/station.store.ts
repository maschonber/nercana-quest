import { computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';
import { StationResources, ResourceType, ResourceChange } from '../../models/station-resources.model';

interface StationState {
  resources: StationResources;
}

const initialState: StationState = {
  resources: {
    goo: 0,
    metal: 0
  }
};

export const StationStore = signalStore(
  { providedIn: 'root' },
  withState<StationState>(initialState),
  withComputed((store) => ({
    /**
     * Get total resource count for display purposes
     */
    totalResources: computed(() => {
      const resources = store.resources();
      return resources.goo + resources.metal;
    }),

    /**
     * Check if station has any resources
     */
    hasResources: computed(() => {
      const resources = store.resources();
      return resources.goo > 0 || resources.metal > 0;
    })
  })),
  withMethods((store) => ({
    /**
     * Adds goo to station resources
     */
    addGoo(amount: number, source: string = 'Unknown'): ResourceChange {
      const currentResources = store.resources();
      const previousAmount = currentResources.goo;
      const newAmount = Math.max(0, previousAmount + amount);
      
      patchState(store, {
        resources: {
          ...currentResources,
          goo: newAmount
        }
      });

      return {
        type: ResourceType.GOO,
        amount,
        previousAmount,
        newAmount,
        source
      };
    },

    /**
     * Adds metal to station resources
     */
    addMetal(amount: number, source: string = 'Unknown'): ResourceChange {
      const currentResources = store.resources();
      const previousAmount = currentResources.metal;
      const newAmount = Math.max(0, previousAmount + amount);
      
      patchState(store, {
        resources: {
          ...currentResources,
          metal: newAmount
        }
      });

      return {
        type: ResourceType.METAL,
        amount,
        previousAmount,
        newAmount,
        source
      };
    },

    /**
     * Spends goo from station resources
     */
    spendGoo(amount: number, source: string = 'Unknown'): ResourceChange | null {
      const currentResources = store.resources();
      const previousAmount = currentResources.goo;
      
      if (previousAmount < amount) {
        return null; // Insufficient resources
      }
      
      const newAmount = previousAmount - amount;
      
      patchState(store, {
        resources: {
          ...currentResources,
          goo: newAmount
        }
      });

      return {
        type: ResourceType.GOO,
        amount: -amount,
        previousAmount,
        newAmount,
        source
      };
    },

    /**
     * Spends metal from station resources
     */
    spendMetal(amount: number, source: string = 'Unknown'): ResourceChange | null {
      const currentResources = store.resources();
      const previousAmount = currentResources.metal;
      
      if (previousAmount < amount) {
        return null; // Insufficient resources
      }
      
      const newAmount = previousAmount - amount;
      
      patchState(store, {
        resources: {
          ...currentResources,
          metal: newAmount
        }
      });

      return {
        type: ResourceType.METAL,
        amount: -amount,
        previousAmount,
        newAmount,
        source
      };
    },

    /**
     * Sets resource amounts directly (useful for debugging/testing)
     */
    setResources(goo: number, metal: number): void {
      patchState(store, {
        resources: {
          goo: Math.max(0, goo),
          metal: Math.max(0, metal)
        }
      });
    },

    /**
     * Resets all resources to zero
     */
    resetResources(): void {
      patchState(store, { resources: initialState.resources });
    },

    /**
     * Gets current amount of specific resource
     */
    getResourceAmount(type: ResourceType): number {
      const resources = store.resources();
      return resources[type];
    },

    /**
     * Checks if station has enough of a specific resource
     */
    hasEnoughResource(type: ResourceType, amount: number): boolean {
      return this.getResourceAmount(type) >= amount;
    }
  }))
);
