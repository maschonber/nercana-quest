# Jest Testing Guide for Nercana

This guide covers how to write and run tests for the Nercana project.

## Running Tests

```bash
# Run all Jest tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Generate test coverage report
npm run test:coverage

# Run Playwright tests
npm run playwright:test

# Open Playwright test report
npm run playwright:report

# Run Playwright tests with UI
npm run playwright:ui

# Generate Playwright test code
npm run playwright:codegen
```

## Test Structure

Tests should follow this general structure:

```typescript
import { TestBed } from '@angular/core/testing';
import { YourComponent } from './your.component';
import { DependencyService } from './dependency.service';

// Create mocks if needed
const mockDependency = {
  someMethod: jest.fn(),
  someProperty: 'test'
};

describe('YourComponent', () => {
  let component: YourComponent;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [/* Required modules */],
      declarations: [/* Required components if not standalone */],
      providers: [
        { provide: DependencyService, useValue: mockDependency }
      ]
    });
    
    component = TestBed.createComponent(YourComponent).componentInstance;
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  // More test cases...
});
```

## Mocking in Jest

### Function Mocks

```typescript
// Mock a function
const mockFunction = jest.fn();

// Mock implementation
const mockFunction = jest.fn(() => 'result');

// Mock return value
mockFunction.mockReturnValue('result');

// Mock promise resolution
mockFunction.mockResolvedValue('result');

// Verify calls
expect(mockFunction).toHaveBeenCalled();
expect(mockFunction).toHaveBeenCalledWith('arg1', 'arg2');
```

### Class/Service Mocks

```typescript
// Mock a service
const mockService = {
  getData: jest.fn().mockReturnValue(['item1', 'item2']),
  saveData: jest.fn()
};
```

### Angular Signal Mocks

For NgRx Signal Store components, create mocks like this:

```typescript
import { signal } from '@angular/core';

const mockStore = {
  // Mock signals
  data: signal(['item1', 'item2']),
  
  // Mock methods
  updateData: jest.fn()
};
```

## Testing Asynchronous Code

```typescript
it('should handle async operations', async () => {
  // Using async/await
  const result = await component.asyncMethod();
  expect(result).toBe('expected');
  
  // Or using done callback
  component.asyncMethod().then(result => {
    expect(result).toBe('expected');
    done();
  });
});
```

## Common Jest Matchers

```typescript
// Equality
expect(value).toBe(primitive); // Strict equality (===)
expect(value).toEqual(object); // Deep equality

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThan(3);

// Strings
expect(value).toMatch(/regexp/);

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(length);

// Objects
expect(object).toHaveProperty('property');

// Exceptions
expect(() => fn()).toThrow();
expect(() => fn()).toThrow('specific message');
```

## Tips for Jest Testing

1. Keep tests small and focused
2. Use descriptive test names that explain what is being tested
3. Follow the AAA pattern (Arrange, Act, Assert)
4. Reset mocks between tests when needed
5. Use beforeEach for setup and afterEach for cleanup
6. Mock the minimum necessary to test your code

## Debugging Tips

If tests fail unexpectedly:

1. Use console.log() in tests to debug values
2. Check Jest output for detailed failure information

# Playwright End-to-End Testing Guide

In addition to Jest for unit testing, Nercana uses Playwright for end-to-end testing.

## Running Playwright Tests

# Run all Playwright tests
npm run playwright:test

# Run tests with UI mode
npm run playwright:ui

# View test report after running tests
npm run playwright:report
```

## Writing Playwright Tests

Playwright tests are located in the `tests` directory. Basic example structure:

```typescript
import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  // Navigate to the page
  await page.goto('http://localhost:4200/');
  
  // Interact with elements
  await page.getByRole('button', { name: 'Start Quest' }).click();
  
  // Assert conditions
  await expect(page.locator('.quest-results')).toBeVisible();
});
```
