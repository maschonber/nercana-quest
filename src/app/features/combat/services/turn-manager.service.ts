import { Injectable } from '@angular/core';
import { Combatant } from '../models/combat.model';

interface TurnQueueEntry {
  combatant: Combatant | null; // null for status effect turns
  nextActionTime: number;
  isStatusEffectTurn?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TurnManager {
  private turnQueue: TurnQueueEntry[] = [];
  private currentTime: number = 0;

  /**
   * Calculates the next status effect time that's divisible by 100 and greater than current time
   */
  private getNextStatusEffectTime(): number {
    const nextInterval = Math.floor(this.currentTime / 100 + 1) * 100;
    return nextInterval;
  }

  /**
   * Adds the next status effect turn to the queue
   */
  private addNextStatusEffectTurn(): void {
    const nextTime = this.getNextStatusEffectTime();
    this.turnQueue.push({
      combatant: null,
      nextActionTime: nextTime,
      isStatusEffectTurn: true
    });
  }

  /**
   * Initializes the turn queue with all combatants based on their speed
   */
  initializeTurnQueue(combatants: Combatant[]): void {
    this.turnQueue = [];
    this.currentTime = 0;

    combatants.forEach((combatant) => {
      // Calculate initial action delay based on speed (lower delay = faster action)
      // Base delay is 100, reduced by speed. Minimum delay is 30.
      const actionDelay = Math.max(30, 100 - combatant.speed);

      this.turnQueue.push({
        combatant,
        nextActionTime: actionDelay,
        isStatusEffectTurn: false
      });
    });

    // Add first status effect turn at time 100
    this.addNextStatusEffectTurn();

    // Sort by next action time (soonest first)
    this.turnQueue.sort((a, b) => a.nextActionTime - b.nextActionTime);
  }

  /**
   * Gets the next actor based on speed and scheduling, or indicates a status effect turn
   */
  getNextActor(): { combatant: Combatant | null; isStatusEffectTurn: boolean } {
    // Filter out dead/fled combatants from queue, but keep status effect turns
    this.turnQueue = this.turnQueue.filter(
      (entry) => entry.isStatusEffectTurn || (entry.combatant && entry.combatant.isAlive && !entry.combatant.hasFled)
    );

    if (this.turnQueue.length === 0) {
      return { combatant: null, isStatusEffectTurn: false };
    }

    // Find the entry with the earliest next action time
    const nextEntry = this.turnQueue[0];

    // Advance time to when this entry should process
    this.currentTime = nextEntry.nextActionTime;

    if (nextEntry.isStatusEffectTurn) {
      // Handle status effect turn
      // Remove the current status effect entry
      this.turnQueue.shift();
      
      // Schedule the next status effect turn
      this.addNextStatusEffectTurn();

      // Resort the queue for next turn
      this.turnQueue.sort((a, b) => a.nextActionTime - b.nextActionTime);

      return { combatant: null, isStatusEffectTurn: true };
    } else {
      // Handle regular combatant turn
      const actingCombatant = nextEntry.combatant!;

      // Schedule this combatant's next action
      // Action delay is based on speed: faster combatants act more frequently
      const actionDelay = Math.max(30, 100 - actingCombatant.speed);
      nextEntry.nextActionTime = this.currentTime + actionDelay;

      // Resort the queue for next turn
      this.turnQueue.sort((a, b) => a.nextActionTime - b.nextActionTime);

      return { combatant: actingCombatant, isStatusEffectTurn: false };
    }
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

  /**
   * Checks if the current time is a status effect interval (divisible by 100)
   */
  isStatusEffectTime(): boolean {
    return this.currentTime % 100 === 0 && this.currentTime > 0;
  }
}
