import { TestBed } from '@angular/core/testing';
import { RandomService, ProductionRandomProvider, TestRandomProvider } from './random.service';

describe('RandomService with ProductionRandomProvider', () => {
  let service: RandomService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductionRandomProvider,
        RandomService
      ]
    });
    service = TestBed.inject(RandomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate random numbers between 0 and 1', () => {
    const random = service.random();
    expect(random).toBeGreaterThanOrEqual(0);
    expect(random).toBeLessThan(1);
  });

  it('should generate random integers in range', () => {
    const randomInt = service.randomInt(1, 10);
    expect(randomInt).toBeGreaterThanOrEqual(1);
    expect(randomInt).toBeLessThanOrEqual(10);
    expect(Number.isInteger(randomInt)).toBe(true);
  });

  it('should choose random elements from array', () => {
    const array = ['a', 'b', 'c', 'd'];
    const choice = service.randomChoice(array);
    expect(array).toContain(choice);
  });

  it('should roll dice with probability', () => {
    // Test deterministic edges
    const alwaysTrue = service.rollDice(1.0);
    expect(alwaysTrue).toBe(true);
    
    const alwaysFalse = service.rollDice(0.0);
    expect(alwaysFalse).toBe(false);
  });

  it('should generate random floats in range', () => {
    const randomFloat = service.randomFloat(1.5, 3.7);
    expect(randomFloat).toBeGreaterThanOrEqual(1.5);
    expect(randomFloat).toBeLessThanOrEqual(3.7);
  });  it('should generate variance values within range', () => {
    // Test randomVariance with base value 1.0 and 20% variance
    // This should generate values between 0.8 and 1.2
    let inRangeCount = 0;
    const iterations = 100;
    const baseValue = 1.0;
    const variancePercent = 0.2; // 20% variance
    const expectedMin = baseValue - (baseValue * variancePercent);
    const expectedMax = baseValue + (baseValue * variancePercent);
    
    for (let i = 0; i < iterations; i++) {
      const variance = service.randomVariance(baseValue, variancePercent);
      if (variance >= expectedMin && variance <= expectedMax) {
        inRangeCount++;
      }
    }
    
    // Expect at least 95% of values to be in range
    const successRate = inRangeCount / iterations;
    expect(successRate).toBeGreaterThanOrEqual(0.95);
  });
});

describe('RandomService with TestRandomProvider', () => {
  let service: RandomService;
  let testProvider: TestRandomProvider;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TestRandomProvider,
        { provide: RandomService, useFactory: (provider: TestRandomProvider) => provider, deps: [TestRandomProvider] }
      ]
    });
    testProvider = TestBed.inject(TestRandomProvider);
    service = TestBed.inject(RandomService);
  });

  it('should return predetermined sequence', () => {
    testProvider.setSequence([0.1, 0.5, 0.9]);
    
    expect(service.random()).toBe(0.1);
    expect(service.random()).toBe(0.5);
    expect(service.random()).toBe(0.9);
  });
  it('should reset and reuse sequence when reset() is called', () => {
    testProvider.setSequence([0.2, 0.8]);
    
    expect(service.random()).toBe(0.2);
    expect(service.random()).toBe(0.8);
    
    // Reset the sequence to start over
    testProvider.reset();
    expect(service.random()).toBe(0.2); // Back to start
    expect(service.random()).toBe(0.8);
  });

  it('should make dice rolls deterministic', () => {
    testProvider.setSequence([0.3, 0.7]);
    
    expect(service.rollDice(0.5)).toBe(true);  // 0.3 < 0.5
    expect(service.rollDice(0.5)).toBe(false); // 0.7 > 0.5
  });

  it('should make array choices deterministic', () => {
    const array = ['first', 'second', 'third'];
    testProvider.setSequence([0.0, 0.5, 0.99]);
    
    expect(service.randomChoice(array)).toBe('first');  // 0.0 -> index 0
    expect(service.randomChoice(array)).toBe('second'); // 0.5 -> index 1
    expect(service.randomChoice(array)).toBe('third');  // 0.99 -> index 2
  });

  it('should make integer generation deterministic', () => {
    testProvider.setSequence([0.0, 0.5, 0.99]);
    
    expect(service.randomInt(1, 5)).toBe(1); // 0.0 -> min value
    expect(service.randomInt(1, 5)).toBe(3); // 0.5 -> middle value
    expect(service.randomInt(1, 5)).toBe(5); // 0.99 -> max value
  });

  it('should reset to fallback behavior', () => {
    testProvider.setSequence([0.1]);
    testProvider.enableFallback();
    
    expect(service.random()).toBe(0.1); // Uses sequence first
    
    const fallbackValue = service.random(); // Falls back to Math.random()
    expect(fallbackValue).toBeGreaterThanOrEqual(0);
    expect(fallbackValue).toBeLessThan(1);
  });

  it('should reset sequence by calling setSequence again', () => {
    testProvider.setSequence([0.1, 0.2]);
    service.random(); // Use first value
    
    testProvider.setSequence([0.1, 0.2]); // Reset to same sequence
    expect(service.random()).toBe(0.1); // Back to start
  });
});
