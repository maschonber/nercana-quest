import { Injectable, inject } from '@angular/core';
import { StationStore } from '../stores/station.store';
import { ResourceType, ResourceChange } from '../../models/station-resources.model';

/**
 * Facade service for station resource management
 * Provides a clean API for components to interact with station resources
 */
@Injectable({
  providedIn: 'root'
})
export class StationFacadeService {
  private readonly stationStore = inject(StationStore);

  // Expose store signals
  resources = this.stationStore.resources;
  hasResources = this.stationStore.hasResources;
  totalResources = this.stationStore.totalResources;

  /**
   * Adds goo to station resources
   */
  addGoo(amount: number, source: string = 'Quest reward'): ResourceChange {
    return this.stationStore.addGoo(amount, source);
  }

  /**
   * Adds metal to station resources
   */
  addMetal(amount: number, source: string = 'Quest reward'): ResourceChange {
    return this.stationStore.addMetal(amount, source);
  }

  /**
   * Spends goo from station resources
   */
  spendGoo(amount: number, source: string = 'Station upgrade'): ResourceChange | null {
    return this.stationStore.spendGoo(amount, source);
  }

  /**
   * Spends metal from station resources
   */
  spendMetal(amount: number, source: string = 'Station upgrade'): ResourceChange | null {
    return this.stationStore.spendMetal(amount, source);
  }

  /**
   * Gets current amount of specific resource
   */
  getResourceAmount(type: ResourceType): number {
    return this.stationStore.getResourceAmount(type);
  }

  /**
   * Checks if station has enough of a specific resource
   */
  hasEnoughResource(type: ResourceType, amount: number): boolean {
    return this.stationStore.hasEnoughResource(type, amount);
  }

  /**
   * Resets all resources (useful for testing)
   */
  resetResources(): void {
    this.stationStore.resetResources();
  }

  /**
   * Sets resource amounts directly (useful for testing/debugging)
   */
  setResources(goo: number, metal: number): void {
    this.stationStore.setResources(goo, metal);
  }
}
