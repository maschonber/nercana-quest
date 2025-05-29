import { Injectable } from '@angular/core';
import { Combatant } from '../models/combat.model';

interface TurnQueueEntry {
  combatant: Combatant;
  nextActionTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class TurnManager {
  private turnQueue: TurnQueueEntry[] = [];
  private currentTime: number = 0;

  /**
   * Initializes the turn queue with all combatants based on their speed
   */
  initializeTurnQueue(combatants: Combatant[]): void {
    this.turnQueue = [];
    this.currentTime = 0;
    
    combatants.forEach(combatant => {
      // Calculate initial action delay based on speed (lower delay = faster action)
      // Base delay is 100, reduced by speed. Minimum delay is 10.
      const actionDelay = Math.max(10, 100 - combatant.speed * 3);
      
      this.turnQueue.push({
        combatant,
        nextActionTime: actionDelay
      });
    });
    
    // Sort by next action time (soonest first)
    this.turnQueue.sort((a, b) => a.nextActionTime - b.nextActionTime);
  }

  /**
   * Gets the next actor based on speed and scheduling
   */
  getNextActor(): Combatant | null {
    // Filter out dead/fled combatants from queue
    this.turnQueue = this.turnQueue.filter(entry => 
      entry.combatant.isAlive && !entry.combatant.hasFled
    );
    
    if (this.turnQueue.length === 0) {
      return null;
    }
    
    // Find the combatant with the earliest next action time
    const nextEntry = this.turnQueue[0];
    const actingCombatant = nextEntry.combatant;
    
    // Advance time to when this combatant acts
    this.currentTime = nextEntry.nextActionTime;
    
    // Schedule this combatant's next action
    // Action delay is based on speed: faster combatants act more frequently
    const actionDelay = Math.max(10, 100 - actingCombatant.speed * 3);
    nextEntry.nextActionTime = this.currentTime + actionDelay;
    
    // Resort the queue for next turn
    this.turnQueue.sort((a, b) => a.nextActionTime - b.nextActionTime);
    
    return actingCombatant;
  }

  /**
   * Resets the turn manager for a new combat
   */
  reset(): void {
    this.turnQueue = [];
    this.currentTime = 0;
  }

  /**
   * Gets the current combat time
   */
  getCurrentTime(): number {
    return this.currentTime;
  }
}
