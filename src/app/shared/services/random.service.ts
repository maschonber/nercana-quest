import { Injectable } from '@angular/core';

/**
 * Abstract base class for random number generation
 * Allows for different implementations in production vs testing
 */
export abstract class RandomProvider {
  abstract random(): number;
  
  /**
   * Generate a random integer between min and max (inclusive)
   */
  randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }
  
  /**
   * Select a random element from an array
   */
  randomChoice<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot select from empty array');
    }
    return array[Math.floor(this.random() * array.length)];
  }
  
  /**
   * Roll a dice with given probability (0-1)
   */
  rollDice(chance: number): boolean {
    return this.random() < chance;
  }
  
  /**
   * Generate random float between min and max
   */
  randomFloat(min: number, max: number): number {
    return min + this.random() * (max - min);
  }
  
  /**
   * Generate random variance around a base value
   * @param baseValue The base value to vary
   * @param variancePercent The variance as a percentage (0.1 = ±10%)
   */
  randomVariance(baseValue: number, variancePercent: number): number {
    const variance = baseValue * variancePercent;
    return baseValue + (this.random() - 0.5) * 2 * variance;
  }
}

/**
 * Production implementation using Math.random()
 */
@Injectable()
export class ProductionRandomProvider extends RandomProvider {
  random(): number {
    return Math.random();
  }
}

/**
 * Test implementation that allows setting predetermined values
 */
@Injectable()
export class TestRandomProvider extends RandomProvider {
  private values: number[] = [];
  private index = 0;
  private fallbackToRandom = false;
  
  /**
   * Set a sequence of predetermined random values
   */
  setSequence(values: number[]): void {
    this.values = [...values];
    this.index = 0;
    this.fallbackToRandom = false;
  }
  
  /**
   * Enable fallback to Math.random() when sequence is exhausted
   * Useful for tests that don't need to control all random calls
   */
  enableFallback(): void {
    this.fallbackToRandom = true;
  }
  
  /**
   * Reset to use Math.random() for all calls
   */
  useRealRandom(): void {
    this.values = [];
    this.index = 0;
    this.fallbackToRandom = true;
  }
  
  random(): number {
    if (this.index < this.values.length) {
      return this.values[this.index++];
    }
    
    if (this.fallbackToRandom) {
      return Math.random();
    }
    
    throw new Error(`Random sequence exhausted. Called ${this.index + 1} times but only ${this.values.length} values provided.`);
  }
  
  /**
   * Get how many random values have been consumed
   */
  getCallCount(): number {
    return this.index;
  }
  
  /**
   * Reset the sequence to start from the beginning
   */
  reset(): void {
    this.index = 0;
  }
}

/**
 * Main random service for dependency injection
 * Uses ProductionRandomProvider by default
 */
@Injectable({
  providedIn: 'root'
})
export class RandomService extends RandomProvider {
  constructor(private provider: ProductionRandomProvider) {
    super();
  }
  
  random(): number {
    return this.provider.random();
  }
}
